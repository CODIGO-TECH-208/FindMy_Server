import Claim from '../models/Claim.js';
import Item from '../models/Item.js';
import Notification from '../models/Notification.js';
import Chat from '../models/Chat.js';
import { sendClaimNotificationEmail, sendClaimStatusEmail } from '../services/emailService.js';

// submit claim on found item
export const submitClaim = async (req, res) => {
  try {
    const { itemId, reason } = req.body;

    if (!itemId || !reason) {
      return res.status(400).json({ message: "Item ID and reason are required." });
    }

    const item = await Item.findById(itemId).populate("postedBy", "name email");

    if (!item) {
      return res.status(404).json({ message: "Item not found." });
    }

    if (item.type !== "found") {
      return res.status(400).json({ message: "You can only claim found items." });
    }

    if (item.postedBy._id.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot claim your own posted item." });
    }

    // Check if user already submitted a claim for this item
    const existingClaim = await Claim.findOne({ item: itemId, claimant: req.user.id });
    if (existingClaim) {
      return res.status(400).json({ message: "You have already submitted a claim for this item." });
    }

    const claim = await Claim.create({
      item: itemId,
      claimant: req.user.id,
      itemOwner: item.postedBy._id,
      reason
    });

    // Create Notification for the owner
    await Notification.create({
      user: item.postedBy._id,
      type: "claim",
      title: "New Claim Received",
      message: `Someone has made a claim on your found item: ${item.title}`
    });

    // Send email to owner
    // Since req.user only has the decoded jwt payload, we might need claimant name. 
    // Wait, the jwt payload has id, probably not the name. I might need to fetch claimant details to pass name reliably,
    // Or I'll just pass "A user" if claimant name is absent. Let me fetch the claimant to be safe.
    import('../models/User.js').then(async ({ default: User }) => {
      const claimant = await User.findById(req.user.id);
      if (claimant) {
        sendClaimNotificationEmail(item.postedBy.name, item.postedBy.email, claimant.name, item.title);
      }
    });

    return res.status(201).json({
      message: "Claim submitted successfully.",
      claim
    });
  } catch (error) {
    console.error("Submit claim error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// get my claims
export const getMyClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ claimant: req.user.id })
      .populate("item", "title type category images status")
      .populate("itemOwner", "name")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      message: "Your claims retrieved.",
      count: claims.length,
      claims
    });
  } catch (error) {
    console.error("Get my claims error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// get claims on my items
export const getReceivedClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ itemOwner: req.user.id })
      .populate("item", "title type category images status")
      .populate("claimant", "name email profilePicture studentId")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      message: "Received claims retrieved.",
      count: claims.length,
      claims
    });
  } catch (error) {
    console.error("Get received claims error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// accept claim
export const acceptClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    const claim = await Claim.findById(claimId)
      .populate("item", "title status")
      .populate("claimant", "name email");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found." });
    }

    if (claim.itemOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to accept this claim." });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({ message: `Claim is already ${claim.status}.` });
    }

    // Update claim status
    claim.status = "accepted";
    claim.respondedAt = new Date();
    await claim.save();

    // Reject all other pending claims for this item
    await Claim.updateMany(
      { item: claim.item._id, _id: { $ne: claim._id }, status: "pending" },
      { $set: { status: "rejected", respondedAt: new Date() } }
    );

    // Update item status
    await Item.findByIdAndUpdate(claim.item._id, { status: "claimed" });

    // Create Notification
    await Notification.create({
      user: claim.claimant._id,
      type: "accept",
      title: "Claim Accepted",
      message: `Your claim for ${claim.item.title} has been accepted!`
    });

    // Send email
    sendClaimStatusEmail(claim.claimant.name, claim.claimant.email, claim.item.title, "accepted");

    // Also notify rejected claimants? (optional, skipping for now as requirements didn't specify beyond "Claim accepted/rejected - Status updates")
    // Wait, the readme says "Claim accepted/rejected". Let's handle individual rejection in the reject route. The bulk reject above won't trigger emails, which is fine to avoid spam or we could do it async.

    // Create a new Chat between the item owner and the claimant
    await Chat.create({
      claim: claim._id,
      participant1: claim.claimant._id, // Claimant
      participant2: req.user.id         // Item Owner
    });

    return res.status(200).json({
      message: "Claim accepted successfully.",
      claim
    });
  } catch (error) {
    console.error("Accept claim error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// reject claim
export const rejectClaim = async (req, res) => {
  try {
    const claimId = req.params.id;

    const claim = await Claim.findById(claimId)
      .populate("item", "title")
      .populate("claimant", "name email");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found." });
    }

    if (claim.itemOwner.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to reject this claim." });
    }

    if (claim.status !== "pending") {
      return res.status(400).json({ message: `Claim is already ${claim.status}.` });
    }

    claim.status = "rejected";
    claim.respondedAt = new Date();
    await claim.save();

    // Create Notification
    await Notification.create({
      user: claim.claimant._id,
      type: "reject",
      title: "Claim Rejected",
      message: `Your claim for ${claim.item.title} was rejected.`
    });

    // Send Email
    sendClaimStatusEmail(claim.claimant.name, claim.claimant.email, claim.item.title, "rejected");

    return res.status(200).json({
      message: "Claim rejected.",
      claim
    });
  } catch (error) {
    console.error("Reject claim error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
