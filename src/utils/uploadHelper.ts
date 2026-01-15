import { supabase } from "../lib/supabase";

export const uploadCommentImages = async (files: File[], userId: string) => {
    const urls: string[] = [];
    for (const file of files) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from('comment-images').upload(filePath, file);
        if (!error) {
            const { data } = supabase.storage.from('comment-images').getPublicUrl(filePath);
            urls.push(data.publicUrl);
        }
    }
    return urls;
};