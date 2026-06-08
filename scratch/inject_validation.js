const fs = require('fs');

const files = [
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthCertificateView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthPsaEndorsement.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/BirthRegistrationView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathCertificateView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathPsaEndorsement.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/DeathRegistrationView.tsx",
    "c:/My Projects/Web Dev Projects/e-mapandan/app/admin/registrar/[id]/views/MarriageCertificateRequestView.tsx"
];

const errorBadgeHtml = `if (file && file.size > 5 * 1024 * 1024) {
                                                            toast.error("File size exceeds 5MB limit.");
                                                            if (e.target.parentElement) {
                                                                const parent = e.target.parentElement;
                                                                let errEl = parent.querySelector('.file-error-msg');
                                                                if (!errEl) {
                                                                    errEl = document.createElement('div');
                                                                    errEl.className = 'file-error-msg text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center animate-pulse mt-2 z-50';
                                                                    parent.appendChild(errEl);
                                                                }
                                                                errEl.textContent = 'LIMIT UPLOAD ERROR: MAX 5MB ALLOWED';
                                                                setTimeout(() => errEl && errEl.remove(), 4000);
                                                            }
                                                            e.target.value = "";`;

files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // We want to find all occurrences of:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    // and inject the error validation. But wait! Let's check how the setters are handled.
    // The structure typically is:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    //     setXXX(file);
    //     if (file) {
    //         setXXXPreview(URL.createObjectURL(file));
    //     } else {
    //         setXXXPreview(null);
    //     }
    // }}
    // Let's use a regex to match:
    // onChange={(e) => {
    //     (const file = e.target.files\??\.\[0\] \|\| null;)
    //     (set[a-zA-Z0-9_]+\??\((?:file|null)\);)
    //     (?:if \(file\) \{[\s\S]*?\} else \{[\s\S]*?\})?
    // We can parse the lines inside onChange carefully.
    
    // Let's write a replacement function that parses the files.
    // Let's look for:
    // onChange={(e) => {
    //     const file = e.target.files?.[0] || null;
    // and parse until the end of the arrow function block.
    
    // Let's do a regex matching.
    const regex = /onChange=\{\(e\)\s*=>\s*\{([\s\S]*?)\}/g;
    
    let match;
    let modified = false;
    
    // Let's find matches and replace.
    // To make it super robust, let's find the exact lines:
    // const file = e.target.files?.[0] || null;
    // and replace it with:
    // const file = e.target.files?.[0] || null;
    // followed by our check, including appropriate state clearing.
    // To clear the states, we can read the next few lines in the matched onChange:
    // If the next lines contain `setOrFile?.(...)`, we need to call `setOrFile?.(null)` and `setOrPreview?.(null)`.
    // Let's extract those setters!
    
    let newContent = content.replace(/onChange=\{\(e\)\s*=>\s*\{([\s\S]*?)\}/g, (fullMatch, body) => {
        // Only modify if it doesn't already have file.size check
        if (body.includes('file.size >')) {
            return fullMatch;
        }
        
        // Check if there is a file declaration
        const fileDeclMatch = body.match(/(const file\s*=\s*e\.target\.files\??\.\[0\]\s*\|\|\s*null;?)/) ||
                            body.match(/(const file\s*=\s*e\.target\.files\??\.\[0\];?)/);
        
        if (!fileDeclMatch) {
            return fullMatch;
        }
        
        const fileDecl = fileDeclMatch[1];
        
        // Let's find what setters are called in this body, e.g., setOrFile?.(file) or setECopyFile(file)
        const setterMatches = [...body.matchAll(/(set[a-zA-Z0-9_]+(?:\?\.)?)\((?:file|null|URL\.createObjectURL\(file\)|"")\)/g)];
        let settersClearing = '';
        setterMatches.forEach(m => {
            const setterName = m[1];
            settersClearing += `\n                                                            ${setterName}(null);`;
        });
        
        const injection = `\n                                                        if (file && file.size > 5 * 1024 * 1024) {
                                                            toast.error("File size exceeds 5MB limit.");
                                                            if (e.target.parentElement) {
                                                                const parent = e.target.parentElement;
                                                                let errEl = parent.querySelector('.file-error-msg');
                                                                if (!errEl) {
                                                                    errEl = document.createElement('div');
                                                                    errEl.className = 'file-error-msg text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-center animate-pulse mt-2 z-50';
                                                                    parent.appendChild(errEl);
                                                                }
                                                                errEl.textContent = 'LIMIT UPLOAD ERROR: MAX 5MB ALLOWED';
                                                                setTimeout(() => errEl && errEl.remove(), 4000);
                                                            }
                                                            e.target.value = "";${settersClearing}
                                                            return;
                                                        }`;
        
        modified = true;
        const newBody = body.replace(fileDecl, fileDecl + injection);
        return `onChange={(e) => {${newBody}}`;
    });
    
    if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Successfully updated onChange handlers in: ${filePath}`);
    } else {
        console.log(`No onChange handlers needed updates in: ${filePath}`);
    }
});
