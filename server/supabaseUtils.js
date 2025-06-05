const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Upload a buffer or file to a bucket
async function uploadToSupabase(bucket, storagePath, bufferOrPath, contentType = 'video/mp4') {
  let fileBuffer;
  if (Buffer.isBuffer(bufferOrPath)) {
    fileBuffer = bufferOrPath;
  } else {
    fileBuffer = fs.readFileSync(bufferOrPath);
  }
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true,
    });
  if (error) throw error;
  return data;
}

// Download a file from Supabase Storage as a buffer
async function downloadFromSupabase(bucket, storagePath) {
  const { data, error } = await supabase.storage.from(bucket).download(storagePath);
  if (error) throw error;
  // data is a ReadableStream, convert to Buffer
  const chunks = [];
  for await (const chunk of data.stream()) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function getPublicUrl(bucket, storagePath) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

async function deleteFromSupabase(bucket, storagePath) {
  const { data, error } = await supabase.storage.from(bucket).remove([storagePath]);
  if (error) throw error;
  return data;
}

module.exports = {
  uploadToSupabase,
  downloadFromSupabase,
  getPublicUrl,
  deleteFromSupabase,
}; 