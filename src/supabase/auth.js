import { supabase } from '/supabase/supabaseClient.js';

export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        console.error("Error signing up:", error);
        return null;
    }

    const user = data.user;
    console.log(user)

    // Insert profile row linked to this user
    const { error: profileError } = await supabase.from("tblProfiles").insert([
        {
            id: user.id,
            email: email,
            created_at: new Date()
        }
    ]);

    if (profileError) {
        console.error("Error inserting error:", profileError);
        return null;
    }

    return user;
}

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return null;
    }
    return data.session;
}

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return error;
    }
    return true;
}