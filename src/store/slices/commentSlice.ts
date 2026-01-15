import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";

interface Comment {
    id: string;
    created_at: string;
    content: string;
    blog_id: string;
    user_id: string;
    user_email: string;
}

interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    loading: false,
    error: null,
};

export const postComment =createAsyncThunk(
    'comments/post',
    async ({ blog_id, user_id, content, user_email}: {
        blog_id: string;
        user_id: string;
        content: string;
        user_email: string;
    }) => {
        const { data, error } = await supabase
            .from('blog_comments')
            .insert([{ blog_id, user_id, content, user_email }])
            .select()
            .single();
        
            if (error) throw error;
            return data as Comment;
    }
);

export const fetchComments = createAsyncThunk(
    'comments/fetchAll',
    async (blogId: string) => {
        const { data, error } = await supabase
            .from('blog_comments')
            .select('*')
            .eq('blog_id', blogId)
            .order('created_at', { ascending: false });
        
            if (error) throw error;
            return data as Comment[];
    }
);

export const deleteComment = createAsyncThunk(
    'comments/delete',
    async (commentId: string) => {
        const { error } = await supabase
            .from('blog_comments')
            .delete()
            .eq('id', commentId);
    
        if (error) throw error;
        return commentId;
        }
);

export const updateComment = createAsyncThunk(
    'comments/update',
    async ({ id, content }: { id: string; content: string }) => {
        const {data, error } = await supabase
            .from('blog_comments')
            .update({ content })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
);

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Post Comment
            .addCase(postComment.fulfilled, (state, action) => {
                state.comments.unshift(action.payload); // unshift -> Add new comment to top
            })
            // Fetch Comments
            .addCase(fetchComments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchComments.fulfilled,  (state, action) => {
                state.loading = false;
                state.comments = action.payload;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch comments';
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.comments = state.comments.filter((c) => c.id !== action.payload);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                console.error("Delete failed:", action.error.message)
                state.error = action.error.message || "Failed to delete comment";
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.comments.findIndex((c) => c.id === action.payload.id);
                if (index !== -1) {
                    state.comments[index] = action.payload;
                }
            });
    },
});

export default commentSlice.reducer;