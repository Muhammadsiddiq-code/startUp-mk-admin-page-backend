// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");
// const dotenv = require("dotenv");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const http = require("http");
// const { Server } = require("socket.io");

// dotenv.config();

// const app = express();

// // HTTP server yaratamiz (Socket.io uchun)
// const server = http.createServer(app);

// // Socket.io sozlash
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173", // Vite bo'lsa 5173, CRA bo'lsa 3000 o'zgartiring
//     methods: ["GET", "POST"],
//   },
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Uploads papkasi
// const uploadDir = "uploads";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }
// app.use("/uploads", express.static(uploadDir));

// // MongoDB ulanish
// // mongoose
// //   .connect(process.env.MONGO_URI || "mongodb+srv://xamidullayevich10:Ri1f31IXDV0FSAar@cluster0.hd2xzu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //   })
// //   .then(() => console.log("MongoDB muvaffaqiyatli ulandi"))
// //   .catch((err) => console.error("MongoDB ulanish xatosi:", err));

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const JWT_SECRET =
//   process.env.JWT_SECRET || "super-secret-key-uzoq-va-xavfsiz-2025";
  

// // === USER SCHEMA ===
// const UserSchema = new mongoose.Schema({
//   name: { type: String, required: true, trim: true },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     lowercase: true,
//     trim: true,
//   },
//   password: { type: String, required: true, minlength: 6 },
//   role: { type: String, enum: ["user", "admin"], default: "user" },
//   avatar: {
//     type: String,
//     default:
//       "https://avatars.mds.yandex.net/i?id=a0572f15bb64a8c222fa560002b1ab6e987e54e0-5244793-images-thumbs&n=13",
//   },
//   createdAt: { type: Date, default: Date.now },
// });

// UserSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     this.password = await bcrypt.hash(this.password, 12);
//   }
//   next();
// });

// const User = mongoose.model("User", UserSchema);

// // === NEWS SCHEMA ===
// const NewsSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   image: { type: String, default: null },
//   createdAt: { type: Date, default: Date.now },
// });

// const News = mongoose.model("News", NewsSchema);

// // === MULTER ===
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() +
//       "-" +
//       Math.round(Math.random() * 1e9) +
//       path.extname(file.originalname);
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif|webp/;
//     const extname = filetypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = filetypes.test(file.mimetype);
//     if (extname && mimetype) return cb(null, true);
//     cb(new Error("Faqat rasm fayllari!"));
//   },
// });

// // === AUTH MIDDLEWARE ===
// const authMiddleware = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "Token yo'q yoki noto'g'ri" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Token muddati tugagan yoki xato" });
//   }
// };

// // === ADMIN MIDDLEWARE ===
// const adminMiddleware = async (req, res, next) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
//     }
//     if (user.role !== "admin") {
//       return res.status(403).json({ message: "Faqat admin ruxsati bor" });
//     }
//     next();
//   } catch (err) {
//     console.error("Admin middleware xatosi:", err);
//     return res
//       .status(500)
//       .json({ message: "Server xatosi", error: err.message });
//   }
// };

// // === SOCKET.IO REAL-TIME ===
// io.on("connection", (socket) => {
//   console.log("Yangi foydalanuvchi ulandi (Socket.io):", socket.id);

//   socket.on("disconnect", () => {
//     console.log("Foydalanuvchi chiqdi:", socket.id);
//   });
// });

// // === ROUTES ===

// // Register (Faqat birinchi admin yaratish uchun)
// app.post("/api/auth/register", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Barcha maydonlar majburiy" });
//     }

//     // Agar allaqachon foydalanuvchilar bo'lsa, register ishlamasligi kerak
//     const userCount = await User.countDocuments();
//     if (userCount > 0) {
//       return res.status(403).json({
//         message: "Register faqat birinchi admin uchun. Iltimos login qiling.",
//       });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ message: "Bu email band" });

//     // Faqat birinchi foydalanuvchi admin bo'ladi
//     const user = new User({ name, email, password, role: "admin" });
//     await user.save();

//     res.json({ message: "Birinchi admin yaratildi" });
//   } catch (err) {
//     console.error("Register xatosi:", err);
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Login
// app.post("/api/auth/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ message: "Email yoki parol xato" });
//     }

//     const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

//     res.json({
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         avatar: user.avatar,
//       },
//     });
//   } catch (err) {
//     console.error("Login xatosi:", err);
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Joriy user
// app.get("/api/auth/me", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select("-password");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Profil yangilash
// app.put("/api/auth/me", authMiddleware, async (req, res) => {
//   try {
//     const { name, email, currentPassword, newPassword } = req.body;
//     const user = await User.findById(req.user.id);

//     if (email && email !== user.email) {
//       const existing = await User.findOne({ email });
//       if (existing) return res.status(400).json({ message: "Bu email band" });
//     }

//     if (currentPassword && newPassword) {
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch)
//         return res.status(400).json({ message: "Joriy parol noto'g'ri" });
//       user.password = newPassword;
//     }

//     user.name = name || user.name;
//     user.email = email || user.email;

//     await user.save();
//     const updated = await User.findById(user._id).select("-password");
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Avatar yuklash
// app.post(
//   "/api/auth/avatar",
//   authMiddleware,
//   upload.single("avatar"),
//   async (req, res) => {
//     try {
//       if (!req.file)
//         return res.status(400).json({ message: "Rasm tanlanmagan" });

//       const user = await User.findById(req.user.id);
//       if (user.avatar && user.avatar.startsWith("/uploads/")) {
//         const oldPath = path.join(__dirname, user.avatar);
//         if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//       }

//       user.avatar = `/uploads/${req.file.filename}`;
//       await user.save();

//       res.json({ avatar: user.avatar });
//     } catch (err) {
//       res.status(500).json({ message: "Server xatosi" });
//     }
//   }
// );

// // Avatar o'chirish
// app.delete("/api/auth/avatar", authMiddleware, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (user.avatar && user.avatar.startsWith("/uploads/")) {
//       const avatarPath = path.join(__dirname, user.avatar);
//       if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
//     }
//     user.avatar =
//       "https://avatars.mds.yandex.net/i?id=a0572f15bb64a8c222fa560002b1ab6e987e54e0-5244793-images-thumbs&n=13";
//     await user.save();
//     res.json({ message: "Avatar o'chirildi", avatar: user.avatar });
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // === FOYDALANUVCHI BOSHQARUVI ===

// app.get("/api/users", authMiddleware, async (req, res) => {
//   try {
//     const users = await User.find().select("-password");
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Yangi user qo'shish + REAL-TIME BILDIRISH (FAQAT ADMIN)
// app.post("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     console.log("Yangi user qo'shish so'rovi:", { name, email, role });

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Ism, email va parol majburiy" });
//     }

//     const existing = await User.findOne({ email });
//     if (existing) {
//       console.log("Email band:", email);
//       return res.status(400).json({ message: "Bu email mavjud" });
//     }

//     // Rolni formadan olish (default: user)
//     const newUser = new User({
//       name,
//       email,
//       password,
//       role: role || "user",
//     });
//     await newUser.save();

//     const saved = await User.findById(newUser._id).select("-password");
//     console.log("Yangi user yaratildi:", saved);

//     res.status(201).json(saved);

//     // REAL-TIME BILDIRISH
//     io.emit("new-notification", {
//       type: "user",
//       message: `${saved.name} yangi foydalanuvchi (${saved.role}) sifatida qo'shildi`,
//       createdAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("Yangi user xatosi:", err);
//     res.status(500).json({
//       message: "Foydalanuvchi qo'shilmadi",
//       error: err.message,
//     });
//   }
// });

// // User tahrirlash (FAQAT ADMIN)
// app.put("/api/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const updateData = { name, role };

//     if (email) {
//       const existing = await User.findOne({
//         email,
//         _id: { $ne: req.params.id },
//       });
//       if (existing) return res.status(400).json({ message: "Bu email band" });
//       updateData.email = email;
//     }

//     if (password && password.trim()) {
//       // Parolni hash qilish
//       updateData.password = await bcrypt.hash(password, 12);
//     }

//     const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     }).select("-password");

//     if (!updated) return res.status(404).json({ message: "User topilmadi" });

//     res.json(updated);
//   } catch (err) {
//     console.error("User yangilash xatosi:", err);
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // User o'chirish (FAQAT ADMIN)
// app.delete(
//   "/api/users/:id",
//   authMiddleware,
//   adminMiddleware,
//   async (req, res) => {
//     try {
//       if (req.user.id === req.params.id)
//         return res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });

//       const deleted = await User.findByIdAndDelete(req.params.id);
//       if (!deleted) return res.status(404).json({ message: "User topilmadi" });

//       res.json({ message: "User o'chirildi" });
//     } catch (err) {
//       res.status(500).json({ message: "Server xatosi" });
//     }
//   }
// );

// // Boshqa user profil
// app.get("/api/users/:id/profile", authMiddleware, async (req, res) => {
//   try {
//     const currentUser = await User.findById(req.user.id);
//     if (currentUser.role !== "admin")
//       return res.status(403).json({ message: "Faqat admin" });

//     const user = await User.findById(req.params.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User topilmadi" });

//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // === YANGILIKLAR ===

// app.get("/api/news", authMiddleware, async (req, res) => {
//   try {
//     const news = await News.find().sort({ createdAt: -1 });
//     res.json(news);
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// app.post(
//   "/api/news",
//   authMiddleware,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { title, description } = req.body;
//       const image = req.file ? `/uploads/${req.file.filename}` : null;

//       const news = new News({ title, description, image });
//       await news.save();

//       res.json(news);

//       // REAL-TIME BILDIRISH
//       io.emit("new-notification", {
//         type: "news",
//         message: `Yangi yangilik qo'shildi: "${news.title}"`,
//         createdAt: new Date().toISOString(),
//       });
//     } catch (err) {
//       console.error("Yangilik qo'shish xatosi:", err);
//       res.status(500).json({ message: "Yangilik qo'shilmadi" });
//     }
//   }
// );

// app.put(
//   "/api/news/:id",
//   authMiddleware,
//   upload.single("image"),
//   async (req, res) => {
//     try {
//       const { title, description } = req.body;
//       const updateData = { title, description };

//       if (req.file) {
//         const oldNews = await News.findById(req.params.id);
//         if (oldNews && oldNews.image) {
//           const oldPath = path.join(__dirname, oldNews.image);
//           if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
//         }
//         updateData.image = `/uploads/${req.file.filename}`;
//       }

//       const updated = await News.findByIdAndUpdate(req.params.id, updateData, {
//         new: true,
//       });
//       if (!updated)
//         return res.status(404).json({ message: "Yangilik topilmadi" });

//       res.json(updated);
//     } catch (err) {
//       res.status(500).json({ message: "Server xatosi" });
//     }
//   }
// );

// app.delete("/api/news/:id", authMiddleware, async (req, res) => {
//   try {
//     const news = await News.findById(req.params.id);
//     if (!news) return res.status(404).json({ message: "Yangilik topilmadi" });

//     if (news.image) {
//       const filePath = path.join(__dirname, news.image);
//       if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
//     }

//     await News.findByIdAndDelete(req.params.id);
//     res.json({ message: "Yangilik o'chirildi" });
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });

// // Stats
// app.get("/api/stats", authMiddleware, async (req, res) => {
//   try {
//     const userCount = await User.countDocuments();
//     const newsCount = await News.countDocuments();
//     res.json({ userCount, newsCount });
//   } catch (err) {
//     res.status(500).json({ message: "Server xatosi" });
//   }
// });









// // Mana bu qatorni qo'shing va serverni bir marta qayta yuriting:
// User.collection
//   .dropIndex("username_1")
//   .then(() => console.log("Eski username indeksi o'chirildi"))
//   .catch((err) => console.log("Indeks topilmadi yoki allaqachon o'chirilgan"));











// // Server ishga tushirish
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`Server ${PORT}-portda ishlamoqda (Socket.io faol)`);
//   console.log(`Rasm yuklash: http://localhost:${PORT}/uploads`);
// });























const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// HTTP server yaratamiz (Socket.io uchun)
const server = http.createServer(app);

// Socket.io sozlash
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Vite bo'lsa 5173, CRA bo'lsa 3000 o'zgartiring
    methods: ["GET", "POST"],
  },
});

// Middleware
// app.use(cors());
app.use(
  cors({
    origin: "*", // vaqtinchalik hamma originlarga ruxsat (test uchun)
    credentials: true, // cookie va token uchun
  })
);
app.use(express.json());

// Uploads papkasi
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// MongoDB ulanish
// mongoose
//   .connect(process.env.MONGO_URI || "mongodb+srv://xamidullayevich10:Ri1f31IXDV0FSAar@cluster0.hd2xzu5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB muvaffaqiyatli ulandi"))
//   .catch((err) => console.error("MongoDB ulanish xatosi:", err));

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-key-uzoq-va-xavfsiz-2025";

// === USER SCHEMA ===
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar: {
    type: String,
    default:
      "https://avatars.mds.yandex.net/i?id=a0572f15bb64a8c222fa560002b1ab6e987e54e0-5244793-images-thumbs&n=13",
  },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

const User = mongoose.model("User", UserSchema);

// === NEWS SCHEMA ===
const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

const News = mongoose.model("News", NewsSchema);

// === MULTER ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Faqat rasm fayllari!"));
  },
});

// === AUTH MIDDLEWARE ===
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token yo'q yoki noto'g'ri" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token muddati tugagan yoki xato" });
  }
};

// === ADMIN MIDDLEWARE ===
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Faqat admin ruxsati bor" });
    }
    next();
  } catch (err) {
    console.error("Admin middleware xatosi:", err);
    return res
      .status(500)
      .json({ message: "Server xatosi", error: err.message });
  }
};

// === SOCKET.IO REAL-TIME ===
io.on("connection", (socket) => {
  console.log("Yangi foydalanuvchi ulandi (Socket.io):", socket.id);

  socket.on("disconnect", () => {
    console.log("Foydalanuvchi chiqdi:", socket.id);
  });
});

// === ROUTES ===

// Register (Faqat birinchi admin yaratish uchun)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Barcha maydonlar majburiy" });
    }

    // Agar allaqachon foydalanuvchilar bo'lsa, register ishlamasligi kerak
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return res.status(403).json({
        message: "Register faqat birinchi admin uchun. Iltimos login qiling.",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Bu email band" });

    // Faqat birinchi foydalanuvchi admin bo'ladi
    const user = new User({ name, email, password, role: "admin" });
    await user.save();

    res.json({ message: "Birinchi admin yaratildi" });
  } catch (err) {
    console.error("Register xatosi:", err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email yoki parol xato" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.error("Login xatosi:", err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Joriy user
app.get("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Profil yangilash
app.put("/api/auth/me", authMiddleware, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (email && email !== user.email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: "Bu email band" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Joriy parol noto'g'ri" });
      user.password = newPassword;
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Avatar yuklash
app.post(
  "/api/auth/avatar",
  authMiddleware,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "Rasm tanlanmagan" });

      const user = await User.findById(req.user.id);
      if (user.avatar && user.avatar.startsWith("/uploads/")) {
        const oldPath = path.join(__dirname, user.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      user.avatar = `/uploads/${req.file.filename}`;
      await user.save();

      res.json({ avatar: user.avatar });
    } catch (err) {
      res.status(500).json({ message: "Server xatosi" });
    }
  }
);

// Avatar o'chirish
app.delete("/api/auth/avatar", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.avatar && user.avatar.startsWith("/uploads/")) {
      const avatarPath = path.join(__dirname, user.avatar);
      if (fs.existsSync(avatarPath)) fs.unlinkSync(avatarPath);
    }
    user.avatar =
      "https://avatars.mds.yandex.net/i?id=a0572f15bb64a8c222fa560002b1ab6e987e54e0-5244793-images-thumbs&n=13";
    await user.save();
    res.json({ message: "Avatar o'chirildi", avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// === FOYDALANUVCHI BOSHQARUVI ===

app.get("/api/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Yangi user qo'shish + REAL-TIME BILDIRISH (FAQAT ADMIN)
app.post("/api/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log("Yangi user qo'shish so'rovi:", { name, email, role });

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Ism, email va parol majburiy" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      console.log("Email band:", email);
      return res.status(400).json({ message: "Bu email mavjud" });
    }

    // Rolni formadan olish (default: user)
    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
    });
    await newUser.save();

    const saved = await User.findById(newUser._id).select("-password");
    console.log("Yangi user yaratildi:", saved);

    res.status(201).json(saved);

    // REAL-TIME BILDIRISH
    io.emit("new-notification", {
      type: "user",
      message: `${saved.name} yangi foydalanuvchi (${saved.role}) sifatida qo'shildi`,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Yangi user xatosi:", err);
    res.status(500).json({
      message: "Foydalanuvchi qo'shilmadi",
      error: err.message,
    });
  }
});

// User tahrirlash (FAQAT ADMIN)
app.put("/api/users/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updateData = { name, role };

    if (email) {
      const existing = await User.findOne({
        email,
        _id: { $ne: req.params.id },
      });
      if (existing) return res.status(400).json({ message: "Bu email band" });
      updateData.email = email;
    }

    if (password && password.trim()) {
      // Parolni hash qilish
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "User topilmadi" });

    res.json(updated);
  } catch (err) {
    console.error("User yangilash xatosi:", err);
    res.status(500).json({ message: "Server xatosi" });
  }
});

// User o'chirish (FAQAT ADMIN)
app.delete(
  "/api/users/:id",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      if (req.user.id === req.params.id)
        return res.status(400).json({ message: "O'zingizni o'chira olmaysiz" });

      const deleted = await User.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "User topilmadi" });

      res.json({ message: "User o'chirildi" });
    } catch (err) {
      res.status(500).json({ message: "Server xatosi" });
    }
  }
);

// Boshqa user profil
app.get("/api/users/:id/profile", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (currentUser.role !== "admin")
      return res.status(403).json({ message: "Faqat admin" });

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User topilmadi" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// === YANGILIKLAR ===

app.get("/api/news", authMiddleware, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

app.post(
  "/api/news",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const image = req.file ? `/uploads/${req.file.filename}` : null;

      const news = new News({ title, description, image });
      await news.save();

      res.json(news);

      // REAL-TIME BILDIRISH
      io.emit("new-notification", {
        type: "news",
        message: `Yangi yangilik qo'shildi: "${news.title}"`,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Yangilik qo'shish xatosi:", err);
      res.status(500).json({ message: "Yangilik qo'shilmadi" });
    }
  }
);

app.put(
  "/api/news/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const updateData = { title, description };

      if (req.file) {
        const oldNews = await News.findById(req.params.id);
        if (oldNews && oldNews.image) {
          const oldPath = path.join(__dirname, oldNews.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updated = await News.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
      if (!updated)
        return res.status(404).json({ message: "Yangilik topilmadi" });

      res.json(updated);
    } catch (err) {
      res.status(500).json({ message: "Server xatosi" });
    }
  }
);

app.delete("/api/news/:id", authMiddleware, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "Yangilik topilmadi" });

    if (news.image) {
      const filePath = path.join(__dirname, news.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Yangilik o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Stats
app.get("/api/stats", authMiddleware, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const newsCount = await News.countDocuments();
    res.json({ userCount, newsCount });
  } catch (err) {
    res.status(500).json({ message: "Server xatosi" });
  }
});

// Mana bu qatorni qo'shing va serverni bir marta qayta yuriting:
User.collection
  .dropIndex("username_1")
  .then(() => console.log("Eski username indeksi o'chirildi"))
  .catch((err) => console.log("Indeks topilmadi yoki allaqachon o'chirilgan"));

// Server ishga tushirish
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishlamoqda (Socket.io faol)`);
  console.log(`Rasm yuklash: http://localhost:${PORT}/uploads`);
});
