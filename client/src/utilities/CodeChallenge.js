function base64UrlEncode(arrayBuffer) {
    const base64 = btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    return base64UrlEncode(hashBuffer);
}

export { generateCodeChallenge, generateCodeVerifier };
