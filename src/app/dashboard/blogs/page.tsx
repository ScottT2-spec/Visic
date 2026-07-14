"use client";
import { Loader2, Plus } from "lucide-react";
import { Archive, Calendar, ExternalLink, Eye, EyeOff, FileText, Image as ImageIcon, Pencil, Search, Tag, Trash2 } from "@/components/icons/FilledIcons";

import { useState, useEffect, useCallback } from "react";
import { useSite } from "@/context/StoreContext";
import { api } from "@/lib/api-client";

interface BlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  author: string | null;
  category: string | null;
  tags: string[];
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusStyles: Record<string, string> = {
  DRAFT: "bg-surface-100 text-surface-500",
  PUBLISHED: "bg-green-50 text-green-700",
  ARCHIVED: "bg-amber-50 text-amber-700",
};

export default function BlogsPage() {
  const { currentStore } = useSite();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Create/Edit state
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");

  const fetchBlogs = useCallback(async () => {
    if (!currentStore) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    params.set("page", String(page));
    params.set("limit", "20");

    const res = await api.get<{ blogs: BlogItem[]; pagination: { pages: number } }>(
      `/api/sites/${currentStore.id}/blogs?${params}`
    );
    if (res.success && res.data) {
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.pagination?.pages || 1);
    }
    setLoading(false);
  }, [currentStore, search, statusFilter, page]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContentHtml("");
    setCoverImage("");
    setAuthor("");
    setCategory("");
    setTagsInput("");
    setStatus("DRAFT");
    setEditingBlog(null);
  };

  const openCreate = () => {
    resetForm();
    setShowEditor(true);
  };

  const openEdit = async (blog: BlogItem) => {
    if (!currentStore) return;
    // Fetch full blog with content
    const res = await api.get<BlogItem & { contentHtml?: string }>(`/api/sites/${currentStore.id}/blogs/${blog.id}`);
    if (res.success && res.data) {
      const b = res.data;
      setTitle(b.title);
      setExcerpt(b.excerpt || "");
      setContentHtml((b as any).contentHtml || "");
      setCoverImage(b.coverImage || "");
      setAuthor(b.author || "");
      setCategory(b.category || "");
      setTagsInput(b.tags.join(", "));
      setStatus(b.status === "ARCHIVED" ? "DRAFT" : b.status);
      setEditingBlog(b);
      setShowEditor(true);
    }
  };

  const saveBlog = async () => {
    if (!currentStore || !title.trim()) return;
    setSaving(true);

    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim() || undefined,
      contentHtml: contentHtml || undefined,
      coverImage: coverImage.trim() || null,
      author: author.trim() || undefined,
      category: category.trim() || undefined,
      tags,
      status,
    };

    if (editingBlog) {
      const res = await api.patch<BlogItem>(`/api/sites/${currentStore.id}/blogs/${editingBlog.id}`, payload);
      if (res.success) {
        await fetchBlogs();
        setShowEditor(false);
        resetForm();
      }
    } else {
      const res = await api.post<BlogItem>(`/api/sites/${currentStore.id}/blogs`, payload);
      if (res.success) {
        await fetchBlogs();
        setShowEditor(false);
        resetForm();
      }
    }
    setSaving(false);
  };

  const deleteBlog = async (id: string) => {
    if (!currentStore || !confirm("Delete this blog post? This cannot be undone.")) return;
    setDeleteId(id);
    await api.delete(`/api/sites/${currentStore.id}/blogs/${id}`);
    setBlogs((prev) => prev.filter((b) => b.id !== id));
    setDeleteId(null);
  };

  const togglePublish = async (blog: BlogItem) => {
    if (!currentStore) return;
    const newStatus = blog.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const res = await api.patch<BlogItem>(`/api/sites/${currentStore.id}/blogs/${blog.id}`, { status: newStatus });
    if (res.success) {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blog.id ? { ...b, status: newStatus, publishedAt: newStatus === "PUBLISHED" ? new Date().toISOString() : b.publishedAt } : b
        )
      );
    }
  };

  if (!currentStore) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Blog</h1>
          <p className="text-sm text-surface-500 mt-1">Create and manage blog posts for your site</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="h-4 w-4" /> New Post
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search posts..."
            className="input-field pl-10 py-2.5 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field py-2.5 w-40"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900">
            {editingBlog ? "Edit Post" : "New Blog Post"}
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Title *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Blog post title..."
                  className="input-field py-2.5 w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Excerpt</label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary of the post..."
                  rows={3}
                  className="input-field py-2.5 w-full resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Content (HTML)</label>
                <textarea
                  value={contentHtml}
                  onChange={(e) => setContentHtml(e.target.value)}
                  placeholder="Write your blog content here..."
                  rows={10}
                  className="input-field py-2.5 w-full font-mono text-sm resize-y"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Cover Image URL</label>
                <input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="input-field py-2.5 w-full"
                />
                {coverImage && (
                  <img src={coverImage} alt="Cover" className="mt-2 rounded-xl h-32 w-full object-cover" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Author</label>
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author name"
                    className="input-field py-2.5 w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                  <input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. News, Tips"
                    className="input-field py-2.5 w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Tags (comma-separated)</label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="fashion, tips, guide"
                  className="input-field py-2.5 w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "DRAFT" | "PUBLISHED")}
                  className="input-field py-2.5 w-full"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Publish Now</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={saveBlog}
              disabled={saving || !title.trim()}
              className="btn-primary text-sm py-2.5 px-6"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingBlog ? "Update Post" : "Create Post"}
            </button>
            <button
              onClick={() => { setShowEditor(false); resetForm(); }}
              className="btn-secondary text-sm py-2.5 px-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Blog List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="rounded-2xl border border-surface-200 bg-white text-center py-16 px-6">
          <div className="h-14 w-14 rounded-2xl bg-surface-50 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-7 w-7 text-surface-300" />
          </div>
          <h3 className="text-base font-bold text-surface-900 mb-1">No blog posts yet</h3>
          <p className="text-sm text-surface-500 mb-5">Start writing to engage your audience and boost SEO.</p>
          <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5">
            <Plus className="h-4 w-4" /> Write First Post
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
            <div className="divide-y divide-surface-100">
              {blogs.map((blog) => (
                <div key={blog.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-50 transition-colors group">
                  {/* Cover thumbnail */}
                  <div className="h-16 w-24 rounded-xl bg-surface-100 flex-shrink-0 overflow-hidden">
                    {blog.coverImage ? (
                      <img src={blog.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-surface-300" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-surface-900 truncate">{blog.title}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[blog.status]}`}>
                        {blog.status}
                      </span>
                    </div>
                    {blog.excerpt && (
                      <p className="text-xs text-surface-500 truncate mb-1">{blog.excerpt}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-surface-400">
                      {blog.author && <span>{blog.author}</span>}
                      {blog.category && (
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {blog.category}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {blog.publishedAt
                          ? new Date(blog.publishedAt).toLocaleDateString()
                          : new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(blog)}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-600 text-white px-3 py-1.5 text-xs font-semibold hover:bg-brand-700 transition-colors"
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => togglePublish(blog)}
                      className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                      title={blog.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    >
                      {blog.status === "PUBLISHED" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    {blog.status === "PUBLISHED" && (
                      <a
                        href={`/store/${currentStore.slug}/blog/${blog.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-700 transition-colors"
                        title="View live post"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => deleteBlog(blog.id)}
                      disabled={deleteId === blog.id}
                      className="p-2 rounded-lg hover:bg-accent-50 text-surface-400 hover:text-accent-600 transition-colors"
                    >
                      {deleteId === blog.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm py-2 px-3 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-surface-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm py-2 px-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
