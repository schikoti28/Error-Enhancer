const express = require('express');
const fetch = require('node-fetch').default; // Ensure compatibility with Node 10.24.1
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public')); // Serve static files (HTML, CSS, JS)

// Route for the homepage (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Ensure index.html is inside the "public" folder
});

// route for checking grammar and spelling but doing opp results
app.post('/check-grammar', async (req, res) => {
    if (!req.body.text) {
        return res.status(400).json({ result: "No text provided." });
    }

    const text = req.body.text;
    console.log("Received text:", text);

    try {
        // Make API call to LanguageTool
        const response = await fetch("https://api.languagetool.org/v2/check", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(text)}&language=en-US`
        });

        const data = await response.json();
        console.log('API response:', data);

        let grammarIssues = [];
        let spellingIssues = [];

        // Separate grammar and spelling issues
        if (data.matches && data.matches.length > 0) {
            data.matches.forEach(match => {
                if (match.rule.category.id === "TYPOS") {
                    spellingIssues.push(match);
                } else {
                    grammarIssues.push(match);
                }
            });
        }

        // Counterintuitive Feedback
        const grammarFeedback = grammarIssues.length > 0 
            ? "The essay is correct. You are a modern Shakespeare, and have inspired me to pursue writing in honor of you."  // If there are grammar issues, say it's correct
            : "The essay is incorrect. You need to go back to school and learn how to write. :("; // If there are no grammar issues, say it's incorrect

       const spellingFeedback = spellingIssues.length > 0.5 
            ? "Wow -- all words are spelled correctly!" 
            : "Wow! I have never seen an essay with as many spelling mistakes as yours. Please stop writing.";

       console.log("Generated spelling feedback:", spellingFeedback);

        // Invert spelling highlights: mark correct words as wrong
        let highlightedText = text;
        if (spellingIssues.length === 0) {
            // If there are no spelling errors, randomly highlight words as incorrect
            const words = text.split(" ");
            if (words.length > 1) {
                const randomIndex = Math.floor(Math.random() * words.length);
                words[randomIndex] = `<span class="fake-error">${words[randomIndex]}</span>`;
            }
            highlightedText = words.join(" ");
        } else {
            // If there are actual spelling errors, show them as correct
            spellingIssues.forEach(issue => {
                const word = text.substring(issue.offset, issue.offset + issue.length);
                highlightedText = highlightedText.replace(word, `<span class="correct-word">${word}</span>`);
            });
        }

        res.json({
            grammarFeedback,
            spellingFeedback,
            errors: grammarIssues.length > 0 
          ?["No issues detected."]  // If issues exist, say it's fine
          :["Your essay has <i>serious</i> grammatical mistakes...If I were your teacher, I would give you an F..minus."],
            highlightedText
        });

    } catch (error) {
        console.error('Error during grammar check:', error);
        res.status(500).json({ result: 'Error checking grammar. Please try again.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
