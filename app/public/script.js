document.getElementById("check-btn").addEventListener("click", function () {
    const userInput = document.getElementById("input-text").value;

    fetch("/check-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: userInput }),
    })
    .then(response => response.json())  // Convert the response to JSON
    .then(data => {
        document.getElementById("grammar-feedback").innerText = data.grammarFeedback;

        document.getElementById("spelling-feedback").innerText = data.spellingFeedback;

        // Display highlighted text with spelling errors
        document.getElementById("highlighted-text").innerHTML = data.highlightedText;

        // Play the correct sound based on grammar feedback
    const booSound = document.getElementById("boo-sound");
    const cheerSound = document.getElementById("cheer-sound");

        // Assuming you have feedbackType being passed to this function
        function playSound(feedbackType) {
        if (data.grammarFeedback.includes === 'incorrect' || data.spellingFeedback.includes === 'mistakes') {
          booSound.play();
        } 
        else {
          cheerSound.play();
        }
}

       
    })
    .catch(error => console.error("Error:", error));
});
