const fs = require('fs');
const path = require('path');

const files = [
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthCertificateView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthPsaEndorsement.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthRegistrationView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathCertificateView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathPsaEndorsement.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathRegistrationView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/MarriageCertificateRequestView.tsx"
];

const injectValidation = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Let's find all file inputs in the file.
    // They look like:
    // <input type="file" ... accept="..." onChange={(e) => { ... }} />
    // We can replace the onChange blocks or inputs dynamically.
    // However, to be perfectly safe, let's look for:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    //     ...
    // }}
    // Or similar handlers and inject the size verification.
    
    console.log(`Processing: ${filePath}`);
    
    // Pattern 1:
    // accept=".pdf,image/*"
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    //     setOrFile?.(file);
    //     if (file) { ... } else { ... }
    // }}
    
    // Let's replace the accept attribute first if it contains accept=".pdf,image/*" or similar.
    content = content.replace(/accept="\.pdf,image\/\*"/g, 'accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"');
    content = content.replace(/accept="\.pdf,\.jpg,\.jpeg,\.png"/g, 'accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"');
    content = content.replace(/accept="image\/\*"/g, 'accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"');
    
    // We also need to update label descriptions that say "up to 10MB" or similar to "up to 5MB"
    content = content.replace(/up to 10MB/gi, 'up to 5MB');
    
    // Now let's handle the onChange handlers.
    // Since some use setOrFile, some use setECopyFile, some use setReceiptFile, birthRegDocFile, deathRegDocFile, etc.
    // We can match the pattern where a file is obtained from e.target.files?.[0] and inject the check:
    
    // Let's write a generic regex/replacement for:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    // or
    // onChange={(e) => {
    //     const file = e.target.files[0];
    
    // Let's find matches and replace them with:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    //     if (file && file.size > 5 * 1024 * 1024) {
    //         toast.error("File size exceeds 5MB limit.");
    //         if (e.target.parentElement) {
    //             const parent = e.target.parentElement;
    //             let errEl = parent.querySelector('.file-error-msg');
    //             if (!errEl) {
    //                 errEl = document.createElement('div');
    //                 errEl.className = 'file-error-msg text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center animate-pulse mt-2 z-50';
    //                 parent.appendChild(errEl);
    //             }
    //             errEl.textContent = 'LIMIT UPLOAD ERROR: MAX 5MB ALLOWED';
    //             setTimeout(() => errEl && errEl.remove(), 4000);
    //         }
    //         e.target.value = "";
    //         // we need to set corresponding file and preview to null.
    //         // But wait, the name of the setter function varies!
    //         // For general safety, we can just return, set the state, or we can check what the state setter functions are.
    //         // Actually, if we just call the setter with null, we can dynamically detect what setter is called in the next lines.
    //         // But wait, if we just set e.target.value = ""; and return, we should also clear the specific file/preview states.
    //         // Let's parse the exact handler block to see what setter functions are used.
    //     }
    
    // Let's look at the actual content and use exact regex replacements for the specific handlers.
    
    fs.writeFileSync(filePath, content, 'utf8');
};

files.forEach(injectValidation);
console.log("Done updating accept attributes.");
