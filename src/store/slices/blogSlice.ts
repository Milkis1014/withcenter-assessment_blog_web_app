import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '../../lib/supabase'

export interface Blog {
  id: string
  title: string
  content: string
  author_id: string
  image_urls: string[];
  created_at: string
  updated_at: string
}

interface BlogState {
  blogs: Blog[]
  currentBlog: Blog | null
  loading: boolean
  error: string | null
  totalCount: number
  currentPage: number
  pageSize: number
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  totalCount: 0,
  currentPage: 1,
  pageSize: 10,
}

export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async ({ page = 1, pageSize = 10 }: { page?: number; pageSize?: number }) => {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error
    return { blogs: data || [], count: count || 0, page }
  }
)

export const fetchBlogById = createAsyncThunk(
  'blog/fetchBlogById',
  async (id: string) => {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
)

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async ({ title, content, author_id, imageFiles }: { 
    title: string; 
    content: string; 
    author_id: string;
    imageFiles: File[] 
  }) => {
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${author_id}/${fileName}`;
      console.log(`File Path: ${filePath}`);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      /* This code snippet is fetching the public URL of an image file stored in a Supabase storage
      bucket. */
      const { data: { publicUrl } } = await supabase.storage
        .from('blog-images')
        .getPublicUrl(uploadData.path);
      
      imageUrls.push(publicUrl);  
    }

    const { data, error: dbError } = await supabase
      .from('blogs')
      .insert([{ title, content, author_id, image_urls: imageUrls }])
      .select()
      .single()

    if (dbError) throw dbError;
    return data;
  }
)

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, title, content, author_id, imageFiles, existingUrls }: { 
    id: string; 
    title: string; 
    content: string 
    author_id: string;
    imageFiles: File[];
    existingUrls: string[];
  }) => {
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${author_id}/${fileName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(filePath, file);
      
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      /* This code snippet is fetching the public URL of an image file stored in a Supabase storage
      bucket. */
      const { data: { publicUrl } } = await supabase.storage
        .from('blog-images')
        .getPublicUrl(uploadData.path);
      
      imageUrls.push(publicUrl);  
    }

    const finalImageUrls = [...existingUrls, ...imageUrls];

    const { data, error } = await supabase
      .from('blogs')
      .update({ title, content, updated_at: new Date().toISOString(), image_urls: finalImageUrls })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }
)

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id: string) => {
    const { error } = await supabase.from('blogs').delete().eq('id', id)
    if (error) throw error
    return id
  }
)

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload
    },
    clearCurrentBlog: (state) => {
      state.currentBlog = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Blogs
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = action.payload.blogs
        state.totalCount = action.payload.count
        state.currentPage = action.payload.page
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch blogs'
      })
      // Fetch Blog By ID
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false
        state.currentBlog = action.payload
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch blog'
      })
      // Create Blog
      .addCase(createBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.loading = false
        state.blogs.unshift(action.payload)
        state.totalCount += 1
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create blog'
      })
      // Update Blog
      .addCase(updateBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.loading = false
        const index = state.blogs.findIndex((blog) => blog.id === action.payload.id)
        if (index !== -1) {
          state.blogs[index] = action.payload
        }
        if (state.currentBlog?.id === action.payload.id) {
          state.currentBlog = action.payload
        }
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update blog'
      })
      // Delete Blog
      .addCase(deleteBlog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.loading = false
        state.blogs = state.blogs.filter((blog) => blog.id !== action.payload)
        state.totalCount -= 1
        if (state.currentBlog?.id === action.payload) {
          state.currentBlog = null
        }
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete blog'
      })
  },
})

export const { setCurrentPage, setPageSize, clearCurrentBlog, clearError } = blogSlice.actions
export default blogSlice.reducer
