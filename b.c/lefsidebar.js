// Icons import from lucide-react
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

// Avatar component (image show karne ke liye)
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

// Toast notification
import { toast } from 'sonner';

// API call ke liye axios
import axios from 'axios';

// Page navigation ke liye
import { useNavigate } from 'react-router-dom';

// Redux hooks: data fetch and update karne ke liye
import { useDispatch, useSelector } from 'react-redux';

// Redux action to clear user on logout
import { setAuthUser } from '../redux/authSlice';

// Create post modal component
import CreatePost from './CreatePost';

// Redux actions related to posts
import { setPosts, setSelectedPost } from '../redux/postSlice';

// Notification ke liye popover UI
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';

// Real-time like notifications ko clear karne ka action
import { clearLikeNotifications } from '../redux/rtnSlice';

const LeftSidebar = () => {
  const navigate = useNavigate(); // Navigation hook
  const dispatch = useDispatch(); // Redux dispatch

  // Redux store se user data aur notifications le rahe
  const { user } = useSelector(store => store.auth);
  const { likeNotification } = useSelector(store => store.realTimeNotification);

  // Create Post modal open/close state
  const [open, setOpen] = useState(false);

  // Logout ka function
  const logoutHandler = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/user/logout', { withCredentials: true });

      if (res.data.success) {
        // Redux se sab data clear kar do
        dispatch(setAuthUser(null));
        dispatch(setSelectedPost(null));
        dispatch(setPosts([]));

        // Redirect to login
        navigate("/login");

        // Success toast
        toast.success(res.data.message);
      }
    } catch (error) {
      // Agar kuch galti hui
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  // Sidebar ke har button ke click ke liye yeh handler hai
  const sidebarHandler = (textType) => {
    if (textType === 'Logout') {
      logoutHandler();
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`/profile/${user?._id}`);
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === 'Messages') {
      navigate("/chat");
    }
  };

  // Sidebar ke icons aur text define kiye
  const sidebarItems = [
    { icon: <Home />, text: "Home" },
    { icon: <Search />, text: "Search" },
    { icon: <TrendingUp />, text: "Explore" },
    { icon: <MessageCircle />, text: "Messages" },
    { icon: <Heart />, text: "Notifications" },
    { icon: <PlusSquare />, text: "Create" },
    {
      icon: (
        <Avatar className='w-6 h-6'>
          <AvatarImage src={user?.profilePicture} alt="@shadcn" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile"
    },
    { icon: <LogOut />, text: "Logout" },
  ];

  return (
    <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 w-[16%] h-screen'>
      <div className='flex flex-col'>
        <h1 className='my-8 pl-3 font-bold text-xl'>Tripathi</h1>

        <div>
          {sidebarItems.map((item, index) => (
            <div
              onClick={() => sidebarHandler(item.text)}
              key={index}
              className='flex items-center gap-3 relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-3'
            >
              {item.icon}
              <span>{item.text}</span>

              {/* Notifications badge & popover */}
              {item.text === "Notifications" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      size='icon'
                      className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6"
                    >
                      {likeNotification.length}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-80'>
                    <div>
                      <div className='flex justify-between items-center mb-2'>
                        <h2 className='font-semibold text-base'>Notifications</h2>
                        {likeNotification.length > 0 && (
                          <button
                            onClick={() => dispatch(clearLikeNotifications())}
                            className='text-xs text-blue-500 hover:underline'
                          >
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Notifications list */}
                      {
                        likeNotification.length === 0 ? (
                          <p className='text-sm text-gray-500'>No new notifications</p>
                        ) : (
                          likeNotification.map((notification) => (
                            <div key={notification.userId + notification.postId} className='flex items-center gap-2 my-2'>
                              <Avatar>
                                <AvatarImage src={notification.userDetails?.profilePicture} />
                                <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <p className='text-sm'>
                                <span className='font-bold'>{notification.userDetails?.username}</span> liked your post
                              </p>
                            </div>
                          ))
                        )
                      }
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Post modal */}
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
};

export default LeftSidebar;
