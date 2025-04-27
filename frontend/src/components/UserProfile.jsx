import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./Navbar";
import { FaUserCircle, FaLock, FaGlobe, FaShareAlt, FaPlus, FaTimes, FaEdit } from "react-icons/fa";
import { FiTrash2, FiEdit2 } from "react-icons/fi";

const ProfilePage = () => {
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    image: "",
    isPublic: true,
  });

  const [user, setUser] = useState({});
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fullName = localStorage.getItem("username") || "User";
  const email = localStorage.getItem("email") || "user@example.com";
  const photoURL = localStorage.getItem("photoURL") || "https://via.placeholder.com/150";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");

    if (token) {
      setUser({ name, email });

      axios
        .get("http://localhost:8080/api/posts/byLoggedInUser", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        })
        .then((res) => setPosts(res.data))
        .catch((err) => console.error("Error fetching posts:", err));
    }
  }, []);


  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    
    try {
      setLoading(true);
      let res;
      
      if (editingPost) {
        // Update existing post
        res = await axios.put(
          `http://localhost:8080/api/posts/${editingPost.id}`,
          newPost,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        setPosts(posts.map(post => 
          post.id === editingPost.id ? res.data : post
        ));
      } else {
        // Create new post
        res = await axios.post(
          "http://localhost:8080/api/posts",
          newPost,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts([res.data, ...posts]);
      }
      
      setNewPost({ title: "", content: "", image: "", isPublic: true });
      setEditingPost(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving post:", error);
      if (error.response?.status === 403) {
        setError("You don't have permission to update this post");
      } else {
        setError("Failed to save post. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCommunities = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/communities/joined", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJoinedCommunities(res.data);
    } catch (error) {
      console.error("Error fetching communities:", error);
      toast.error("Failed to load communities");
    }
  };

  const handleToggleVisibility = async (id, currentVisibility) => {
    try {
      const res = await axios.put(
        `http://localhost:8080/api/posts/${id}/visibility`,
        { isPublic: !currentVisibility },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(posts.map(post => 
        post.id === id ? { ...post, isPublic: res.data.isPublic } : post
      ));
    } catch (error) {
      console.error("Error updating visibility:", error);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await axios.delete(
          `http://localhost:8080/api/posts/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content,
      image: post.image,
      isPublic: post.isPublic,
    });
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-[#f8f4ff] to-[#eef2ff] p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Error message */}
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
              <p>{error}</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <img 
                src={photoURL} 
                alt="Profile" 
                className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/150";
                }}
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800">{fullName}</h2>
              <p className="text-gray-600">{email}</p>
              <div className="mt-4 flex gap-4 justify-center md:justify-start">
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                  {posts.length} {posts.length === 1 ? "Post" : "Posts"}
                </span>
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {joinedCommunities.length} {joinedCommunities.length === 1 ? "Community" : "Communities"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column - Communities */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Your Communities</h2>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    See All
                  </button>
                </div>
                
                {joinedCommunities.length > 0 ? (
                  <ul className="space-y-3">
                    {joinedCommunities.map((community) => (
                      <li key={community.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                        <div className="bg-indigo-100 text-indigo-800 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                          {community.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-medium">{community.name}</h3>
                          <p className="text-sm text-gray-500">{community.members?.length || 0} members</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">You haven't joined any communities yet.</p>
                    <button className="mt-3 text-indigo-600 hover:text-indigo-800 font-medium">
                      Explore Communities
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Posts */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Your Posts</h2>
                  <button 
                    onClick={() => {
                      setEditingPost(null);
                      setNewPost({ title: "", content: "", image: "", isPublic: true });
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FaPlus /> New Post
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <FiEdit2 className="text-indigo-600 text-3xl" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">Share your thoughts with the community</p>
                    <button 
                      onClick={() => setShowModal(true)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition"
                    >
                      Create Your First Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <div key={post.id} className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition">
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-xl font-bold text-gray-800">{post.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditPost(post)}
                                className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                                title="Edit Post"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleToggleVisibility(post.id, post.isPublic)}
                                className={`p-2 rounded-full ${post.isPublic ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}
                                title={post.isPublic ? "Make Private" : "Make Public"}
                              >
                                {post.isPublic ? <FaGlobe /> : <FaLock />}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-2 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                                title="Delete Post"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4 whitespace-pre-line">{post.content}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${post.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {post.isPublic ? "Public" : "Private"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* New Post Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-xl font-semibold">
                  {editingPost ? "Edit Post" : "Create New Post"}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handlePostSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="What's your post about?"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Content</label>
                  <textarea
                    rows="5"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your thoughts..."
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Image URL (optional)</label>
                  <input
                    type="url"
                    value={newPost.image}
                    onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500"
                  />
                </div>
                <div className="mb-6 flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newPost.isPublic}
                    onChange={(e) => setNewPost({ ...newPost, isPublic: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-gray-700">
                    Make this post public
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPost(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {editingPost ? "Updating..." : "Posting..."}
                      </>
                    ) : (
                      editingPost ? "Update Post" : "Post"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;