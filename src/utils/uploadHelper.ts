import { supabase } from "../lib/supabase";

export const uploadCommentImages = async (imageFiles: File[], userId: string) => {
    // Map files to a list of upload promises for faster concurrent uploading
    const uploadPromises = imageFiles.map(async (file) => {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        
        const { error } = await supabase.storage
            .from('comment-images') // Use the parameter here!
            .upload(filePath, file);

        if (error) {
            console.error(`Upload failed for ${file.name}:`, error.message);
            return null;
        }

        const { data } = supabase.storage.from('comment-images').getPublicUrl(filePath);
        return data.publicUrl;
    });

    const results = await Promise.all(uploadPromises);
    
    // Filter out any null values from failed uploads
    return results.filter((url): url is string => url !== null);
};

export const uploadBlogImages = async (imageFiles: File[], authorId: string) => {
    const imageUrls: string[] = [];

    for (const file of imageFiles) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(7)}.${fileExt}`;
        const filePath = `${authorId}/${fileName}`;
        console.log(`File Path: ${filePath}`);
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("blog-images")
            .upload(filePath, file);

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

        /* This code snippet is fetching the public URL of an image file stored in a Supabase storage
        bucket. */
        const {
            data: { publicUrl },
        } = await supabase.storage
            .from("blog-images")
            .getPublicUrl(uploadData.path);

        imageUrls.push(publicUrl);
    }
    return imageUrls
}

