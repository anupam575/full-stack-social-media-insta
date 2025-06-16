export const addNewPost = async (req, res) => {
// Ek naya post create karne wala function define ho raha hai (async, kyunki andar await hai)
    try {
    // Try block start – agar koi error aaye to catch me chala jaye
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;
        // Caption user ke input se liya, image file se aur author ki ID (JWT ke through middleware se milti hai)
        if (!image) return res.status(400).json({ message: 'Image required' });
        // Agar user image nahi bhejta to 400 error response bhej diya jata hai
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
        // Sharp library use karke image ko resize aur optimize kiya gaya (800x800 max), JPEG format me convert kiya
        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        // Image buffer ko Base64 me convert kiya aur data URI banaya upload ke liye
        const cloudResponse = await cloudinary.uploader.upload(fileUri);
        // Cloudinary pe image upload ki aur response me image ka URL mil gaya
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        // Post model me ek naya post create kiya gaya (caption, image URL aur author ka ID)
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }
        // User ko find karke uski post list me naye post ka ID add kiya gaya, fir user save kiya
        await post.populate({ path: 'author', select: '-password' });
        // Post ke andar author ke details populate kiye gaye (password chhod ke)
        return res.status(201).json({
            message: 'New post added',
            post,
            success: true,
        })
        // Success response bheja gaya client ko (status 201: Created)
    } catch (error) {
        console.log(error);
    }
    // Agar koi bhi error aata hai to console me print hota hai
}
export const getAllPost = async (req, res) => {
    // Function start hua jo sabhi posts laata hai database se
    try {
        // Try block start kiya, error hone par catch me jayega
        const posts = await Post.find().sort({ createdAt: -1 })
        // Post model se sabhi posts find kiye aur naya post pehle aaye isliye descending sort kiya
            .populate({ path: 'author', select: 'username profilePicture' })
        // Har post ke author ka sirf username aur profile photo laaya
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        // Har post ke comments bhi laaye aur har comment me jo author hai uska username aur profilePicture bhi laaya
        return res.status(200).json({
            posts,
            success: true
        })
        // Sabhi posts ke saath success response bheja gaya (status 200)
    } catch (error) {
        console.log(error);
    }
    // Agar koi error aaye to console me print ho jaayega
};
const posts = await Post.find().sort({ createdAt: -1 })
// Post model se sabhi posts find kiye aur naya post pehle aaye isliye descending sort kiya
export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        // Logged in user ki id middleware ke through aayi, wahi authorId banayi
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
        // User ke sabhi post nikal rahe hain, naya pehle isliye descending sort
        .populate({
            path: 'author',
            select: 'username, profilePicture'
        })
        // Har post me author ka username aur profile pic bhi le aaya gaya hai (password hata ke)
        .populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username, profilePicture'
            }
        });
        // Har post ke comments bhi laaye, aur un comments me jisne comment kiya uska username + profile bhi
        return res.status(200).json({
            posts,
            success: true
        })
        // Sab post return kiye user ke liye JSON response me
    } catch (error) {
        console.log(error);
        // Error aaya to console me print
    }
}
export const likePost = async (req, res) => {
    try {
        const likeKrneWalaUserKiId = req.id;
        // JWT middleware se user ki ID milti hai jo post ko like karega

        const postId = req.params.id;
        // URL ke parameter se post ki ID milti hai jisko like karna hai

        const post = await Post.findById(postId);
        // Post ko uski ID se database se dhoond rahe hain

        if (!post) return res.status(404).json({ message: 'Post not found', success: false });
        // Agar post nahi mili toh 404 error return karo

        // like logic started
        await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
        // post ke "likes" array me current user ki ID daal do (agar pehle se nahi hai to hi add hogi)

        await post.save();
        // Post ko database me save kar diya gaya

        const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
        // User ki detail (sirf username aur profile pic) le rahe hai jo like kar raha hai

        const postOwnerId = post.author.toString();
        // Post banane wale author ki ID nikali, string me convert karke

        if(postOwnerId !== likeKrneWalaUserKiId){
            // Agar user apne post ko nahi balki kisi aur ka post like kar raha hai tabhi notification bhejna hai

            const notification = {
                type:'like',
                // Notification ka type "like" rakha

                userId:likeKrneWalaUserKiId,
                // Jisne like kiya uski ID

                userDetails:user,
                // Like karne wale ka username aur profile pic

                postId,
                // Kaunsa post like hua uski ID

                message:'Your post was liked'
                // Notification ka message
            }

            const postOwnerSocketId = getReceiverSocketId(postOwnerId);
            // Jis bande ne post kiya uska socket ID dhoond rahe hai (real-time ke liye)

            io.to(postOwnerSocketId).emit('notification', notification);
            // Socket ke through notification bhej rahe hai post ke owner ko
        }

        return res.status(200).json({message:'Post liked', success:true});
        // Finally client ko response bhej rahe hai ke like ho gaya

    } catch (error) {
        // Agar koi error aayi toh yaha handle ho sakti hai (currently blank hai)
    }
}
export const likePost = async (req, res) => {
try {
const likeKrneWalaUserKiId = req.id;
// JWT middleware se user ki ID milti hai jo post ko like karega


    const postId = req.params.id;
    // URL ke parameter se post ki ID milti hai jisko like karna hai

    const post = await Post.findById(postId);
    // Post ko uski ID se database se dhoond rahe hain

    if (!post) return res.status(404).json({ message: 'Post not found', success: false });
    // Agar post nahi mili toh 404 error return karo

    // like logic started
    await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
    // post ke "likes" array me current user ki ID daal do (agar pehle se nahi hai to hi add hogi)

    await post.save();
    // Post ko database me save kar diya gaya

    const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
    // User ki detail (sirf username aur profile pic) le rahe hai jo like kar raha hai

    const postOwnerId = post.author.toString();
    // Post banane wale author ki ID nikali, string me convert karke

    if(postOwnerId !== likeKrneWalaUserKiId){
        // Agar user apne post ko nahi balki kisi aur ka post like kar raha hai tabhi notification bhejna hai

        const notification = {
            type:'like',
            // Notification ka type "like" rakha

            userId:likeKrneWalaUserKiId,
            // Jisne like kiya uski ID

            userDetails:user,
            // Like karne wale ka username aur profile pic

            postId,
            // Kaunsa post like hua uski ID

            message:'Your post was liked'
            // Notification ka message
        }

        const postOwnerSocketId = getReceiverSocketId(postOwnerId);
        // Jis bande ne post kiya uska socket ID dhoond rahe hai (real-time ke liye)

        io.to(postOwnerSocketId).emit('notification', notification);
        // Socket ke through notification bhej rahe hai post ke owner ko
    }

    return res.status(200).json({message:'Post liked', success:true});
    // Finally client ko response bhej rahe hai ke like ho gaya

} catch (error) {
    // Agar koi error aayi toh yaha handle ho sakti hai (currently blank hai)
}


}
export const addNewPost = async (req, res) => {
try {
const { caption } = req.body; // caption user se body me liya gaya hai
const image = req.file; // image file ko multer se req.file me access kiya gaya hai
const authorId = req.id; // author ki id middleware se req.id me milti hai

```
    if (!image) return res.status(400).json({ message: 'Image required' }); // agar image nahi hai to error return kar do

    // image upload 
    const optimizedImageBuffer = await sharp(image.buffer)
        .resize({ width: 800, height: 800, fit: 'inside' }) // image ka size 800x800 se zyada na ho isliye resize
        .toFormat('jpeg', { quality: 80 }) // format jpeg me convert karo with 80% quality
        .toBuffer(); // final optimized image buffer me convert ho gaya

    // buffer to data uri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`; // buffer ko base64 string me convert karke fileUri banaya
    const cloudResponse = await cloudinary.uploader.upload(fileUri); // cloudinary pe upload kiya aur response me image ka url mila

    const post = await Post.create({
        caption,
        image: cloudResponse.secure_url, // cloudinary se mila hua image URL
        author: authorId // post ka author
    });

    const user = await User.findById(authorId); // user ko database se dhundha
    if (user) {
        user.posts.push(post._id); // user ke posts array me naye post ka ID add kiya
        await user.save(); // user object ko save kiya
    }

    await post.populate({ path: 'author', select: '-password' }); // post me author ke details populate kiye without password

    return res.status(201).json({
        message: 'New post added', // success message
        post, // post ki detail
        success: true,
    })

} catch (error) {
    console.log(error); // error aane par console me show karega
}
```

}

export const getAllPost = async (req, res) => {
try {
const posts = await Post.find().sort({ createdAt: -1 }) // sabhi posts ko newest first ke order me laye
.populate({ path: 'author', select: 'username profilePicture' }) // har post ka author ka username aur photo
.populate({
path: 'comments',
sort: { createdAt: -1 }, // comments ko bhi newest first
populate: {
path: 'author',
select: 'username profilePicture' // comment likhne wale ka bhi naam aur photo
}
});
return res.status(200).json({
posts,
success: true
})
} catch (error) {
console.log(error); // error console me print hoga
}
};

export const getUserPost = async (req, res) => {
try {
const authorId = req.id; // currently logged-in user ki id
const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }) // us user ke sabhi posts newest first
.populate({
path: 'author',
select: 'username, profilePicture' // author ka naam aur profile pic
}).populate({
path: 'comments',
sort: { createdAt: -1 },
populate: {
path: 'author',
select: 'username, profilePicture' // comment ke author ka info
}
});
return res.status(200).json({
posts,
success: true
})
} catch (error) {
console.log(error); // error print
}
}

export const likePost = async (req, res) => {
try {
const likeKrneWalaUserKiId = req.id; // jinhone like kiya unki id
const postId = req.params.id;  // jis post ko like kiya gaya uska id
const post = await Post.findById(postId); // post ko database se dhoonda
if (!post) return res.status(404).json({ message: 'Post not found', success: false }); // agar post nahi mila to error

```
    // like logic started
    await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } }); // likes array me id add ki, duplicate nahi aayega
    await post.save(); // post ko save kiya

    // implement socket io for real time notification
    const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture'); // like karne wale user ka naam aur photo

    const postOwnerId = post.author.toString(); // jisne post banaya uska id string me
    if(postOwnerId !== likeKrneWalaUserKiId){
        // emit a notification event
        const notification = {
            type:'like',
            userId:likeKrneWalaUserKiId, // like karne wale ki id
            userDetails:user, // uske details
            postId,
            message:'Your post was liked' // notification message
        }
        const postOwnerSocketId = getReceiverSocketId(postOwnerId); // socket id mila post owner ka
        io.to(postOwnerSocketId).emit('notification', notification); // real-time socket emit
    }

    return res.status(200).json({message:'Post liked', success:true}); // success response
} catch (error) {
    console.log(error); // error console me print
}
```

}
Certainly bhai! Let's break down this post controller **line by line** in Hindi + English with **imaginative examples**. Maan le Patel, Shivani, aur Rahul teen users hain.

---

### 🔊 `addNewPost`

```js
export const addNewPost = async (req, res) => {
```

// Ek naye post ko server pe store karne ke liye function start hua.

```js
const { caption } = req.body;
const image = req.file;
const authorId = req.id;
```

// Caption body se liya, image file se aur authorId JWT middleware se.
// Imagine karo Patel ek image upload kar raha caption ke saath.

```js
if (!image) return res.status(400).json({ message: 'Image required' });
```

// Agar image nahi mili toh 400 error.

```js
const optimizedImageBuffer = await sharp(image.buffer)
  .resize({ width: 800, height: 800, fit: 'inside' })
  .toFormat('jpeg', { quality: 80 })
  .toBuffer();
```

// Sharp image ko resize + optimize karta hai.
// 800x800 ke andar rakh kar JPEG format banaya.

```js
const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
```

// Buffer ko base64 me convert kiya.

```js
const cloudResponse = await cloudinary.uploader.upload(fileUri);
```

// Image ko Cloudinary me upload kiya, response me URL aaya.

```js
const post = await Post.create({ caption, image: cloudResponse.secure_url, author: authorId });
```

// Post database me bana diya gaya.

```js
const user = await User.findById(authorId);
if (user) { user.posts.push(post._id); await user.save(); }
```

// User ki post list me post ID add ki gayi.

```js
await post.populate({ path: 'author', select: '-password' });
```

// Post ke andar author ki detail (without password) laayi gayi.

```js
return res.status(201).json({ message: 'New post added', post, success: true });
```

// Final success response bheja gaya.

---

### 🔊 `getAllPost`

```js
const posts = await Post.find().sort({ createdAt: -1 })
```

// Sabhi post laayi ja rahi hain nayi se purani.

```js
.populate({ path: 'author', select: 'username profilePicture' })
```

// Author ke naam aur photo dikhaye jaenge.

```js
.populate({ path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username profilePicture' } });
```

// Har post ke comments bhi saath me milenge, comment karne wale ka naam & pic bhi.

```js
return res.status(200).json({ posts, success: true });
```

// Sabhi post ke sath success response bheja gaya.

---

### 🔊 `getUserPost`

```js
const authorId = req.id;
```

// Logged-in user ki ID mili (maan le Rahul login hai)

```js
const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
  path: 'author',
  select: 'username, profilePicture'
}).populate({
  path: 'comments',
  sort: { createdAt: -1 },
  populate: {
    path: 'author',
    select: 'username, profilePicture'
  }
});
```

// Us user ke post fetch kiye ja rahe hain + uske comments bhi.

```js
return res.status(200).json({ posts, success: true });
```

// Final response user ke post ke sath bheja.

---

### 🔊 `likePost`

```js
const likeKrneWalaUserKiId = req.id;
const postId = req.params.id; 
const post = await Post.findById(postId);
```

// User ki ID aur post ID milti hai (maan le Rahul like kar raha hai Patel ka post)

```js
if (!post) return res.status(404).json({ message: 'Post not found', success: false });
```

// Agar post hi nahi mila toh error.

```js
await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
await post.save();
```

// Post me like krne wale ki ID add hui (duplicate nahi hoga addToSet se)

```js
const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
```

// Rahul ka username & photo liya gaya.

```js
const postOwnerId = post.author.toString();
if(postOwnerId !== likeKrneWalaUserKiId){
```

// Agar Rahul ne khud ka post like nahi kiya to (i.e. dusre ka like hai)

```js
const notification = {
  type:'like',
  userId:likeKrneWalaUserKiId,
  userDetails:user,
  postId,
  message:'Your post was liked'
}
```

// Ek notification object banaya gaya.

```js
const postOwnerSocketId = getReceiverSocketId(postOwnerId);
io.to(postOwnerSocketId).emit('notification', notification);
```

// Real-time notification socket se bheji gayi.

```js
return res.status(200).json({message:'Post liked', success:true});
```

// Final response client ko.
Certainly bhai! Let's break down this post controller **line by line** in Hindi + English with **imaginative examples**. Maan le Patel, Shivani, aur Rahul teen users hain.

---

### 🔊 `addNewPost`

```js
export const addNewPost = async (req, res) => {
```

// Naya post add karne ka async function hai

```js
const { caption } = req.body;
const image = req.file;
const authorId = req.id;
```

// Client se caption, image aur author ki ID mil rahi hai

```js
if (!image) return res.status(400).json({ message: 'Image required' });
```

// Agar image nahi di gayi to 400 error bhejna

```js
const optimizedImageBuffer = await sharp(image.buffer)
  .resize({ width: 800, height: 800, fit: 'inside' })
  .toFormat('jpeg', { quality: 80 })
  .toBuffer();
```

// Image ko sharp ke through resize aur compress karna

```js
const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
```

// Optimized image buffer ko base64 URI me convert karna

```js
const cloudResponse = await cloudinary.uploader.upload(fileUri);
```

// Cloudinary par image upload karna aur response lena

```js
const post = await Post.create({ caption, image: cloudResponse.secure_url, author: authorId });
```

// MongoDB me Post create karna

```js
const user = await User.findById(authorId);
if (user) { user.posts.push(post._id); await user.save(); }
```

// User ki posts list me new post ka ID add karna

```js
await post.populate({ path: 'author', select: '-password' });
```

// Post ke author ka detail leke populate karna (password ke bina)

```js
return res.status(201).json({ message: 'New post added', post, success: true });
```

// Final response client ko dena

---

### 🔊 `getAllPost`

```js
const posts = await Post.find().sort({ createdAt: -1 })
```

// Sabhi post fetch karna nayi se purani order me

```js
.populate({ path: 'author', select: 'username profilePicture' })
```

// Author ke username aur profile picture ke saath populate karna

```js
.populate({ path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username profilePicture' } });
```

// Comments ko bhi recent order me laana, aur har comment ke author details bhi laani

```js
return res.status(200).json({ posts, success: true });
```

// Response bhejna

---

### 🔊 `getUserPost`

```js
const authorId = req.id;
```

// Current user ki ID le rahe hain

```js
const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
```

// Sirf us user ke posts fetch kar rahe hain

```js
.populate({ path: 'author', select: 'username, profilePicture' })
```

// Post ke author ka naam aur image populate kar rahe hain

```js
.populate({ path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username, profilePicture' } });
```

// Comments aur unke author ko bhi populate kar rahe hain

```js
return res.status(200).json({ posts, success: true });
```

// Response bhejna

---

### 🔊 `likePost`

```js
const likeKrneWalaUserKiId = req.id;
```

// Like karne wale user ki ID le rahe hain

```js
const postId = req.params.id; 
```

// Jis post ko like karna hai uski ID

```js
const post = await Post.findById(postId);
```

// Post find kar rahe hain

```js
if (!post) return res.status(404).json({ message: 'Post not found', success: false });
```

// Agar post nahi mila to 404 error

```js
await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
```

// Post ke likes me user ID add kar rahe hain (duplicate avoid karne ke liye \$addToSet)

```js
await post.save();
```

// Post save kar rahe hain

```js
const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
```

// Like karne wale user ka naam aur profile picture la rahe hain

```js
const postOwnerId = post.author.toString();
```

// Post ke owner ki ID nikaal rahe hain

```js
if(postOwnerId !== likeKrneWalaUserKiId){
```

// Agar user ne apna khud ka post like nahi kiya hai to

```js
const notification = {
    type:'like',
    userId:likeKrneWalaUserKiId,
    userDetails:user,
    postId,
    message:'Your post was liked'
}
```

// Notification object create kar rahe hain

```js
const postOwnerSocketId = getReceiverSocketId(postOwnerId);
io.to(postOwnerSocketId).emit('notification', notification);
```

// Real-time notification send ho rahi hai socket ke zariye

```js
return res.status(200).json({message:'Post liked', success:true});
```

// Final response client ko

---

(Next section me `dislikePost`, `addComment`, `getCommentsOfPost`, `deletePost`, `bookmarkPost` bhi isi tarah line-by-line explain kiya jayega — ready ho ja!)
Certainly bhai! Let's break down this post controller **line by line** in Hindi + English with **imaginative examples**. Maan le Patel, Shivani, aur Rahul teen users hain.

---

### 🔊 `addNewPost`

```js
export const addNewPost = async (req, res) => {
```

// Ek naye post ko server pe store karne ke liye function start hua.

```js
const { caption } = req.body;
const image = req.file;
const authorId = req.id;
```

// Caption body se liya, image file se aur authorId JWT middleware se.
// Imagine karo Patel ek image upload kar raha caption ke saath.

```js
if (!image) return res.status(400).json({ message: 'Image required' });
```

// Agar image nahi mili toh 400 error.

```js
const optimizedImageBuffer = await sharp(image.buffer)
  .resize({ width: 800, height: 800, fit: 'inside' })
  .toFormat('jpeg', { quality: 80 })
  .toBuffer();
```

// Sharp image ko resize + optimize karta hai.
// 800x800 ke andar rakh kar JPEG format banaya.

```js
const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
```

// Buffer ko base64 me convert kiya.

```js
const cloudResponse = await cloudinary.uploader.upload(fileUri);
```

// Image ko Cloudinary me upload kiya, response me URL aaya.

```js
const post = await Post.create({ caption, image: cloudResponse.secure_url, author: authorId });
```

// Post database me bana diya gaya.

```js
const user = await User.findById(authorId);
if (user) { user.posts.push(post._id); await user.save(); }
```

// User ki post list me post ID add ki gayi.

```js
await post.populate({ path: 'author', select: '-password' });
```

// Post ke andar author ki detail (without password) laayi gayi.

```js
return res.status(201).json({ message: 'New post added', post, success: true });
```

// Final success response bheja gaya.

---

### 🔊 `getAllPost`

```js
const posts = await Post.find().sort({ createdAt: -1 })
```

// Sabhi post laayi ja rahi hain nayi se purani.

```js
.populate({ path: 'author', select: 'username profilePicture' })
```

// Author ke naam aur photo dikhaye jaenge.

```js
.populate({ path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username profilePicture' } });
```

// Har post ke comments bhi saath me milenge, comment karne wale ka naam & pic bhi.

```js
return res.status(200).json({ posts, success: true });
```

// Final success response

---

### 🔊 `getUserPost`

```js
const authorId = req.id;
```

// JWT token se current user ki ID milti hai.

```js
const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
```

// Sirf user ke khud ke posts laaye ja rahe hain.

```js
.populate({ path: 'author', select: 'username, profilePicture' })
```

// Author info add hoti hai.

```js
.populate({ path: 'comments', sort: { createdAt: -1 }, populate: { path: 'author', select: 'username, profilePicture' } });
```

// Comments bhi laaye ja rahe hain aur unke author ka info bhi.

```js
return res.status(200).json({ posts, success: true });
```

// JSON response

---

### 🔊 `likePost`

```js
const likeKrneWalaUserKiId = req.id;
const postId = req.params.id; 
```

// JWT se liker ka ID mila aur URL param se postId.

```js
const post = await Post.findById(postId);
```

// Post database se fetch kiya.

```js
if (!post) return res.status(404).json({ message: 'Post not found', success: false });
```

// Agar post nahi mila to error.

```js
await post.updateOne({ $addToSet: { likes: likeKrneWalaUserKiId } });
```

// Like add hua post ke likes array me (repeat avoid hoga).

```js
await post.save();
```

// Changes ko save kiya.

```js
const user = await User.findById(likeKrneWalaUserKiId).select('username profilePicture');
```

// Liker ka info laaya gaya.

```js
const postOwnerId = post.author.toString();
if(postOwnerId !== likeKrneWalaUserKiId){
```

// Agar self-like nahi hai to notification bhejni hai.

```js
const notification = {
  type:'like',
  userId:likeKrneWalaUserKiId,
  userDetails:user,
  postId,
  message:'Your post was liked'
}
```

// Notification ka object banaya.

```js
const postOwnerSocketId = getReceiverSocketId(postOwnerId);
io.to(postOwnerSocketId).emit('notification', notification);
```

// Socket ke zariye real-time notification.

```js
return res.status(200).json({message:'Post liked', success:true});
```

// Response return

---

### 🔊 `dislikePost`

```js
await post.updateOne({ $pull: { likes: likeKrneWalaUserKiId } });
```

// Like ko remove kiya gaya.

```js
const notification = {
  type:'dislike',
  userId:likeKrneWalaUserKiId,
  userDetails:user,
  postId,
  message:'Your post was liked'
}
```

// Notification ka message galti se "liked" likha gaya hai, isse "disliked" hona chahiye tha.

---

### 🔊 `addComment`

```js
const comment = await Comment.create({ text, author:commentKrneWalaUserKiId, post:postId })
```

// Comment database me ban gaya.

```js
await comment.populate({ path:'author', select:"username profilePicture" });
```

// Author info comment ke saath link hua.

```js
post.comments.push(comment._id);
await post.save();
```

// Post ke comments me ID add hui.

---

### 🔊 `getCommentsOfPost`

```js
const comments = await Comment.find({post:postId}).populate('author', 'username profilePicture');
```

// Post ke sabhi comments fetch kiye aur author ka data bhi include kiya.

---

### 🔊 `deletePost`

```js
if(post.author.toString() !== authorId) return res.status(403).json({message:'Unauthorized'});
```

// Sirf author hi post delete kar sakta hai.

```js
await Comment.deleteMany({post:postId});
```

// Post delete hone par uske comments bhi delete ho jaate hain.

---

### 🔊 `bookmarkPost`

```js
if(user.bookmarks.includes(post._id))
```

// Agar pehle se bookmarked hai to hata dena hai.

```js
await user.updateOne({$addToSet:{bookmarks:post._id}});
```

// Agar nahi hai to add kar dena hai.

---

✅ Bhai ye raha tera full controller file ka explanation, har ek line ka code ke neeche.

Ab chahe to mai is file ka PDF export format, ya aur kisi format me bhi de sakta hu tujhko revision ke liye. Bolna bas! 🚀
