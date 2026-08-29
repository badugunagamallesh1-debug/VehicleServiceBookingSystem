const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith(".tsx") || file.endsWith(".ts")) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);

files.forEach(file => {
    let content = fs.readFileSync(file, "utf8");
    let original = content;

    // Replace $15.00, $10, etc.
    content = content.replace(/\$(\d+)/g, "?$1");
    
    // Replace $${...}
    content = content.replace(/\$\$\{/g, "?${");
    
    // Replace >$...<
    content = content.replace(/>\$(?=\{|\d)/g, ">?");
    
    // Replace `$` in `` `$${stats.totalRevenue}` `` -> covered by `\$\$\{`
    // What about `> ${` ?
    content = content.replace(/>\s*\$(?=\{|\d)/g, "> ?");

    // Remove `(approx. ?{(booking.totalAmount * 83).toFixed(0)})` and similar 
    content = content.replace(/\s*\(approx\.\s*?\{\([^}]+\}\)\)/g, "");
    // And ` (?{(booking.totalAmount * 83).toFixed(0)})`
    content = content.replace(/\s*\(?\{\([^}]+\}\)\)/g, "");
    
    // Also `Pickup: ${booking.pickupRequested ? 'Requested ($15.00)' : 'N/A'}`
    // But `$15.00` is covered by `\$(\d+)`.

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
});
