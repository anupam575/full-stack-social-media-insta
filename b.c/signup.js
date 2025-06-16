import React, { useState } from 'react';
// useState: input fields ka data track karne ke liye

import { Input } from './ui/input';
// Input: Custom UI component form ke input ke liye

import { Button } from './ui/button';
// Button: Custom styled button component

import axios from 'axios';
// axios: API call karne ke liye

import { toast } from 'sonner';
// toast: Success/Error message dikhane ke liye

import { Link, useNavigate } from 'react-router-dom';
// Link: Dusre page pe jaane ke liye
// useNavigate: programmatically page change karne ke liye

import { Loader2 } from 'lucide-react';
// Loader2: Spinner icon for loading

const Signup = () => {
  // Input fields ka initial state
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: ""
  });

  // Loading spinner dikhane ke liye state
  const [loading, setLoading] = useState(false);

  // useNavigate: Signup ke baad login page pe redirect
  const navigate = useNavigate();

  // Input box me change hone par value update karne wala function
  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  }

  // Signup button press hone par chalega
  const signupHandler = async (e) => {
    e.preventDefault(); // Form reload roko

    try {
      setLoading(true); // Spinner chalu karo

      // API call to backend for signup
      const res = await axios.post('http://localhost:8080/api/v1/user/register', input, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // cookies ke liye
      });

      if (res.data.success) {
        navigate("/login"); // Redirect to login
        toast.success(res.data.message); // Toast success message

        // Form inputs reset
        setInput({
          username: "",
          email: "",
          password: ""
        });
      }

    } catch (error) {
      console.log(error);
      // Agar error aaye toh error message dikhaye
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false); // Spinner band karo
    }
  }

  // JSX => UI
  return (
    <div className='flex items-center w-screen h-screen justify-center'>
      <form onSubmit={signupHandler} className='shadow-lg flex flex-col gap-5 p-8'>
        {/* Header */}
        <div className='my-4'>
          <h1 className='text-center font-bold text-xl'>LOGO</h1>
          <p className='text-sm text-center'>Signup to see photos & videos from your friends</p>
        </div>

        {/* Username Input */}
        <div>
          <span className='font-medium'>Username</span>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {/* Email Input */}
        <div>
          <span className='font-medium'>Email</span>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {/* Password Input */}
        <div>
          <span className='font-medium'>Password</span>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="focus-visible:ring-transparent my-2"
          />
        </div>

        {/* Button ya Spinner conditionally dikhana */}
        {
          loading ? (
            <Button>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Please wait
            </Button>
          ) : (
            <Button type='submit'>Signup</Button>
          )
        }

        {/* Login link */}
        <span className='text-center'>
          Already have an account? <Link to="/login" className='text-blue-600'>Login</Link>
        </span>
      </form>
    </div>
  )
}

export default Signup;
