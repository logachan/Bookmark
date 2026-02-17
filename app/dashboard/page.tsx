"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import Modal from "../components/Modal";

export default function Dashboard() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks();
    getUser();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
  };

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    
    setIsAdding(true);
    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from("bookmarks").insert([
      {
        title,
        url,
        user_id: userData.user?.id,
      },
    ]);

    if (error) {
      toast.error("Failed to add bookmark");
    } else {
      toast.success("Bookmark added successfully");
      setTitle("");
      setUrl("");
      fetchBookmarks();
    }
    
    setIsAdding(false);
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    const { error } = await supabase.from("bookmarks").delete().eq("id", itemToDelete);

    if (error) {
      toast.error("Failed to delete bookmark");
    } else {
      toast.success("Bookmark deleted successfully");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchBookmarks();
    }
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-gray-200/20 dark:border-gray-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold text-xl shadow-inner">
                B
              </div>
              <span className="text-xl font-bold text-white drop-shadow-md">
                Bookmarks
              </span>
            </div>
            <div className="flex items-center gap-4">
               {user && (
                <span className="text-sm text-white/90 font-medium hidden sm:block drop-shadow-sm">
                  {user.email}
                </span>
              )}
              <button
                onClick={confirmLogout}
                className="text-sm font-medium text-white/80 hover:text-white transition-colors drop-shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Bookmark Form */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="glass-panel p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Add New Bookmark</h2>
            <form onSubmit={addBookmark} className="flex flex-col sm:flex-row gap-3">
              <input
                className="input-field flex-1"
                placeholder="Title (e.g., My Portfolio)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                className="input-field flex-1"
                placeholder="URL (https://...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isAdding}
                className="btn-primary whitespace-nowrap flex items-center justify-center gap-2"
              >
                {isAdding ? (
                   <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              
              <div>
                <div className="flex items-start justify-between mb-4">
                   <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
                     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                     </svg>
                   </div>
                   <button
                    onClick={() => confirmDelete(b.id)}
                    className="group/delete p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete Bookmark"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                       <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight" title={b.title}>
                  {b.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-6 font-medium">
                  {b.url}
                </p>
              </div>

              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl shadow-sm hover:shadow transition-all duration-200"
               >
                Visit Website
                <svg className="w-4 h-4 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                   <polyline points="15 3 21 3 21 9" />
                   <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          ))}
          {bookmarks.length === 0 && (
             <div className="col-span-full text-center py-20 text-white/80">
                <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm">
                    <svg className="w-8 h-8 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium drop-shadow-sm">No bookmarks yet. Add your first one!</p>
             </div>
          )}
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Bookmark"
        message="Are you sure you want to delete this bookmark? This action cannot be undone."
        type="danger"
        confirmText="Delete"
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        type="info"
        confirmText="Sign Out"
      />
    </div>
  );
}
