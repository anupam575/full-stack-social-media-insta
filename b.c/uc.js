Chalo bhai, is **User Controller** file ko bhi line-by-line Hindi-English mix me explain karte hain. Phir se Patel, Shivani aur Rahul ki examples lenge jahan zarurat ho.

---

### 📦 **Imports**

```js
import { User } from "../models/user.model.js";
```

* `User` model import kiya gaya jo MongoDB me users ke documents ko represent karta hai.

```js
import bcrypt from "bcryptjs";
```

* Password hashing ke liye `bcryptjs` liya gaya.

```js
import jwt from "jsonwebtoken";
```

* Token generate karne ke liye `jsonwebtoken` use hoga.

```js
import getDataUri from "../utils/datauri.js";
```

* File ko base64 me convert karne ke liye utility function.

```js
import cloudinary from "../utils/cloudinary.js";
```

* Cloudinary pe image upload karne ke liye custom utility.

```js
import { Post } from "../models/post.model.js";
```

* `Post` model bhi import kiya gaya — login ke time posts populate karne ke liye.

---

### 📝 **Register Function**

```js
export const register = async (req, res) => {
```

* Naya user create karne ke liye function.

```js
const { username, email, password } = req.body;
```

* Body se data liya gaya: username, email, password.

```js
if (!username || !email || !password) {
```

* Agar koi field missing hai toh error bhej dena.

```js
const user = await User.findOne({ email });
```

* Check kiya ki ye email already exist toh nahi karta.

```js
const hashedPassword = await bcrypt.hash(password, 10);
```

* Password ko securely hash kar diya.

```js
await User.create({...})
```

* Naya user bana diya database me.

```js
return res.status(201).json({...})
```

* Success message bhej diya.

---

### 🔑 **Login Function**

```js
export const login = async (req, res) => {
```

* Login ke liye function.

```js
let user = await User.findOne({ email });
```

* Email se user search kiya.

```js
const isPasswordMatch = await bcrypt.compare(password, user.password);
```

* Password check kiya.

```js
const token = await jwt.sign({...})
```

* JWT token banaya jo 1 din me expire hoga.

```js
const populatedPosts = await Promise.all(...);
```

* Us user ke sare posts fetch kiye jo usne banaye the.

```js
user = {...}
```

* User ka new object banaya jo frontend ko bhejna hai.

```js
return res.cookie('token', token, {...}).json({...})
```

* Token cookie me set kiya + response bheja.

---

### 🔓 **Logout Function**

```js
export const logout = async (_, res) => {
```

* Logout ka function.

```js
return res.cookie("token", "", { maxAge: 0 }).json({...})
```

* Token expire kar diya (empty kar diya).

---

### 👤 **Get Profile Function**

```js
export const getProfile = async (req, res) => {
```

* Kisi bhi user ka profile lane ke liye.

```js
let user = await User.findById(userId).populate(...);
```

* Us user ko uske posts aur bookmarks ke saath populate kiya.

```js
return res.status(200).json({...})
```

* Profile data response me bheja.

---

### 🖼️ **Edit Profile Function**

```js
export const editProfile = async (req, res) => {
```

* Logged in user ke profile edit karne ka function.

```js
const fileUri = getDataUri(profilePicture);
```

* File ko base64 URI banaya.

```js
cloudResponse = await cloudinary.uploader.upload(fileUri);
```

* Cloudinary me upload kiya image.

```js
const user = await User.findById(userId).select('-password');
```

* User ko database se laaya without password.

```js
user.bio = bio; ... user.save();
```

* Bio, gender, image wagairah update kiye aur save kiya.

```js
return res.status(200).json({...})
```

* Final updated user bhej diya response me.

---

### 🔍 **Get Suggested Users**

```js
export const getSuggestedUsers = async (req, res) => {
```

* Logged in user ke alawa sabko dikhane wala function.

```js
const suggestedUsers = await User.find({ _id: { $ne: req.id } }).select("-password");
```

* Sab users laayega jo current user nahi hain.

```js
return res.status(200).json({...})
```

* Unka list frontend ko bhej diya.

---

### 👥 **Follow or Unfollow Function**

```js
export const followOrUnfollow = async (req, res) => {
```

* Ye function dono kaam karta hai: follow ya unfollow.

```js
const followKrneWala = req.id; const jiskoFollowKrunga = req.params.id;
```

* Example: Patel (current user) Shivani ko follow karta hai.

```js
const isFollowing = user.following.includes(jiskoFollowKrunga);
```

* Pehle check karo already follow kar rahe ho ya nahi.

```js
if (isFollowing) { ... } else { ... }
```

* Agar haan, toh unfollow karo.
* Agar nahi, toh follow karo.

```js
await Promise.all([...])
```

* MongoDB me dono users ka data ek saath update kiya.

```js
return res.status(200).json({...})
```



