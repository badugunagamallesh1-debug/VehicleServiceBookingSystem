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

    // Fix the corrupted question marks
    // `?15.00` -> `₹15.00`
    content = content.replace(/\?(\d+)/g, "₹$1");
    
    // `?${` -> `₹${`
    content = content.replace(/\?\$\{/g, "₹${");
    
    // `>?` -> `>₹`
    content = content.replace(/>\?/g, ">₹");
    
    // `> ?` -> `> ₹`
    content = content.replace(/>\s*\?/g, "> ₹");

    // Also, there are still some `$` left which I didn't replace because they were inside things like `(approx. ₹{(booking.totalAmount * 83).toFixed(0)})` which I failed to remove correctly because they didn't match the regex due to parenthesis escaping in JS strings?
    // Let's replace any remaining `$` before digits or `{` that were not touched
    content = content.replace(/\$(\d+)/g, "₹$1");
    content = content.replace(/\$\$\{/g, "₹${");
    content = content.replace(/>\$(?=\{|\d)/g, ">₹");
    content = content.replace(/>\s*\$(?=\{|\d)/g, "> ₹");

    // Fix the `Requested (?15.00)`
    content = content.replace(/\(\?(\d+\.\d+)\)/g, "(₹$1)");

    // Fix the conversion strings left over
    content = content.replace(/\s*\(approx\.\s*₹\{\(?[^}]+\}?\}\)/g, "");
    content = content.replace(/\s*\(₹\{\(?[^}]+\}?\}\)/g, "");
    
    // The previous regex might have missed: `(approx. ₹{(booking.totalAmount * 83).toFixed(0)})`
    // Let's use a simpler regex
    content = content.replace(/\s*\(approx\.\s*₹\{[^}]+\}\)/g, "");
    content = content.replace(/\s*\(₹\{[^}]+\}\)/g, "");

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
});
