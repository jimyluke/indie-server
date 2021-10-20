const AuthenticationController = require("./controllers/authentication");
const UserController = require("./controllers/user");
const ChatController = require("./controllers/chat");
const FieldDataController = require("./controllers/fielddata");
const CommentController = require("./controllers/comment");
const NotificationController = require("./controllers/notification");
const ReportController = require("./controllers/report");
const FaqController = require("./controllers/faq");
const AdminController = require("./controllers/admin");
const JWPlayerController = require("./controllers/jwplayer");

const express = require("express");
const passport = require("passport");
const ROLE_ADMIN = require("./constants").ROLE_ADMIN;
const multer = require("multer");

const passportService = require("./config/passport");

// Middleware to require login/auth
const requireAuth = passport.authenticate("jwt", { session: false });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

module.exports = function (app) {
  // Initializing route groups
  const apiRoutes = express.Router(),
    authRoutes = express.Router(),
    userRoutes = express.Router(),
    chatRoutes = express.Router(),
    commentRoutes = express.Router(),
    notificationRoutes = express.Router(),
    reportRoutes = express.Router(),
    faqRoutes = express.Router(),
    adminRoutes = express.Router(),
    jwplayerRoutes = express.Router(),
    fieldDataRoutes = express.Router();

  //= ========================
  // Auth Routes
  //= ========================
  apiRoutes.use("/auth", authRoutes);
  // Participant Registration route
  authRoutes.post(
    "/user-register",
    AuthenticationController.participantRegister
  );
  // Login route
  authRoutes.post("/login", AuthenticationController.login);
  // Password reset request route (generate/send token)
  authRoutes.post("/forgot-password", AuthenticationController.forgotPassword);
  // Password reset route (change password using token)
  authRoutes.post(
    "/reset-password/:token",
    AuthenticationController.verifyToken
  );
  // Password reset route (change password using security question)
  authRoutes.post(
    "/reset-password-security",
    AuthenticationController.resetPasswordSecurity
  );
  // Verify route
  authRoutes.post("/verify", AuthenticationController.confirmEmail);
  // Resend verification route
  authRoutes.post("/resend", AuthenticationController.resendVerification);

  //= ========================
  // User Routes
  //= ========================
  apiRoutes.use("/user", userRoutes);
  // View user profile route
  userRoutes.get("/:userId", UserController.viewProfile);
  // delete user route
  userRoutes.delete("/:userId", requireAuth, UserController.deleteProfile);
  // Update user profile route
  userRoutes.post("/", requireAuth, UserController.updateProfile);
  // Test protected route
  apiRoutes.get("/protected", requireAuth, UserController.getUserSession);
  // Admin route
  apiRoutes.get(
    "/admins-only",
    requireAuth,
    AuthenticationController.roleAuthorization(ROLE_ADMIN),
    (req, res) => {
      res.send({ content: "Admin dashboard is working." });
    }
  );
  // Block user profile route
  userRoutes.post("/block/:id", requireAuth, UserController.blockUser);
  // All user route
  userRoutes.get(
    "/simple-user/list",
    requireAuth,
    UserController.listSimpleParticipants
  );
  // All Unverified participant route
  userRoutes.get(
    "/unverified/list",
    requireAuth,
    UserController.adminListUnverifiedParticipants
  );
  // Verify user profile route
  userRoutes.post(
    "/unverified/:id",
    requireAuth,
    UserController.adminVerifyParticipant
  );
  // Verify user invite route
  userRoutes.post("/invite/verify", UserController.inviteVerifyUser);

  //= ========================
  // JWPlayer Routes
  //= ========================
  apiRoutes.use("/jwplayer", jwplayerRoutes);
  // Upload new video route
  jwplayerRoutes.post(
    "/upload",
    requireAuth,
    upload.single("file"),
    JWPlayerController.uploadVideo
  );
  jwplayerRoutes.post(
    "/upload_url",
    requireAuth,
    JWPlayerController.uploadVideoFromURL
  );
  jwplayerRoutes.get("/list", requireAuth, JWPlayerController.fetchVideoList);
  jwplayerRoutes.get("/search", requireAuth, JWPlayerController.searchVideos);
  jwplayerRoutes.get("/my-list", requireAuth, JWPlayerController.fetchMyList);
  jwplayerRoutes.put("/update", requireAuth, JWPlayerController.updateVideo);
  jwplayerRoutes.get("/media/:media_id", JWPlayerController.fetchVideoById);

  //= ========================
  // Admin Routes
  //= ========================
  apiRoutes.use("/admin", adminRoutes);
  // Get All admin user profile route
  adminRoutes.get(
    "/participant/all",
    requireAuth,
    AdminController.listAdminUsers
  );
  // Update user role
  adminRoutes.post("/role/:id", requireAuth, AdminController.updateRole);
  // admin user route
  adminRoutes.get("/user/:id", requireAuth, AdminController.getAdminUser);
  // update admin user route
  adminRoutes.post("/user/:id", requireAuth, AdminController.upateAdminUser);
  // get admin email templates route
  adminRoutes.get("/ipaddress", AdminController.checkIpAddress);

  //= ========================
  // Project comment Routes
  //= ========================
  apiRoutes.use("/comment", commentRoutes);
  // Create comment route
  commentRoutes.post("/", requireAuth, CommentController.createComment);
  // Create challenge comment route
  commentRoutes.post(
    "/challenge",
    requireAuth,
    CommentController.createChallengeComment
  );
  // Update comment route
  commentRoutes.put("/", requireAuth, CommentController.updateComment);
  // List comment route
  commentRoutes.get("/:projectId", requireAuth, CommentController.listComment);
  // List challenge comment route
  commentRoutes.get(
    "/challenge/:challengeId",
    requireAuth,
    CommentController.listChallengeComment
  );
  // Delete comment route
  commentRoutes.delete(
    "/:commentId",
    requireAuth,
    CommentController.deleteComment
  );
  // Like comment route
  commentRoutes.post(
    "/like/:commentId",
    requireAuth,
    CommentController.likeComment
  );

  //= ========================
  // Field Data code Routes
  //= ========================
  apiRoutes.use("/fields", fieldDataRoutes);
  // Create field data route
  fieldDataRoutes.post("/", requireAuth, FieldDataController.createFieldData);
  // List field data route
  fieldDataRoutes.get("/", FieldDataController.listFieldData);
  // Delete field data route
  fieldDataRoutes.delete(
    "/:id",
    requireAuth,
    FieldDataController.deleteFieldData
  );
  // Adjust Mentor route
  fieldDataRoutes.post(
    "/set-mentor",
    requireAuth,
    FieldDataController.setMentorData
  );
  // Adjust Summary route
  fieldDataRoutes.post(
    "/summary",
    requireAuth,
    FieldDataController.setSummaryData
  );
  // Adjust List column route
  fieldDataRoutes.post(
    "/update",
    requireAuth,
    FieldDataController.updateFieldData
  );

  //= ========================
  // Chat Routes
  //= ========================
  apiRoutes.use("/chat", chatRoutes);
  // View messages to and from authenticated user
  chatRoutes.get("/", requireAuth, ChatController.getConversations);
  // Retrieve single conversation
  chatRoutes.get(
    "/:conversationId",
    requireAuth,
    ChatController.getConversation
  );
  // Create team chat route
  chatRoutes.post("/team/new", requireAuth, ChatController.createTeamChat);
  // Invite members to team chat route
  chatRoutes.post(
    "/invite/:channelId",
    requireAuth,
    ChatController.inviteMember
  );
  // Send reply in conversation
  chatRoutes.post("/:conversationId", requireAuth, ChatController.sendReply);
  // Start new conversation
  chatRoutes.post(
    "/new/:recipient",
    requireAuth,
    ChatController.newConversation
  );
  // Update message route
  chatRoutes.put("/message", requireAuth, ChatController.updateMessage);
  // Delete message route
  chatRoutes.delete(
    "/message/:messageId",
    requireAuth,
    ChatController.deleteMessage
  );
  // Block chat route
  chatRoutes.post("/block/:userid", requireAuth, ChatController.blockChat);
  // Block chat route
  chatRoutes.get(
    "/participant/:userid",
    requireAuth,
    ChatController.getOneConversation
  );

  //= ========================
  // Notification Routes
  //= ========================
  apiRoutes.use("/notification", notificationRoutes);
  // Send All participant notification route
  notificationRoutes.post(
    "/all",
    requireAuth,
    NotificationController.notifyAllUsers
  );
  // Get All notification route
  notificationRoutes.get(
    "/",
    requireAuth,
    NotificationController.getNotification
  );
  // Read notification route
  notificationRoutes.post(
    "/read",
    requireAuth,
    NotificationController.readNotification
  );

  //= ========================
  // Report Routes
  //= ========================
  apiRoutes.use("/report", reportRoutes);
  // Create Report route
  reportRoutes.post(
    "/participant/:userid",
    requireAuth,
    ReportController.createReport
  );
  // Resove Report route
  reportRoutes.put("/:id", requireAuth, ReportController.resolveReport);
  // List all report route
  reportRoutes.get("/list", ReportController.getReports);

  //= ========================
  // Faq Routes
  //= ========================
  apiRoutes.use("/faq", faqRoutes);
  // create faq route
  faqRoutes.post("/", requireAuth, FaqController.createFaq);
  // List faq route
  faqRoutes.get("/", requireAuth, FaqController.listFaq);
  // update faq route
  faqRoutes.put("/", requireAuth, FaqController.updateFaq);
  // update faq route
  faqRoutes.put("/bulk/list", requireAuth, FaqController.bulkUpdateFaq);
  // delete faq route
  faqRoutes.delete("/:id", requireAuth, FaqController.deleteFaq);

  // Set url for API group routes
  app.use("/api", apiRoutes);
};
