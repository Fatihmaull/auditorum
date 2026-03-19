// lib/ipfs.ts
// Service to upload encrypted blobs to Pinata

export async function uploadToIPFS(blob: Blob, fileName: string): Promise<string> {
  const data = new FormData();
  data.append("file", blob, fileName);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
      },
      body: data,
    });

    if (!res.ok) {
      throw new Error(`Pinata upload failed: ${res.statusText}`);
    }

    const json = await res.json();
    return json.IpfsHash; // Return the CID
  } catch (err: any) {
    console.error("IPFS Upload Error:", err);
    throw new Error("Failed to upload to decentralized storage");
  }
}
