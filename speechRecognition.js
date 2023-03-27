if ("webkitSpeechRecognition" in window) {
    // Initialize webkitSpeechRecognition
    let speechRecognition = new webkitSpeechRecognition();

    // String for the Final Transcript
    let final_transcript = "";

    // Set the properties for the Speech Recognition object
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.lang = document.querySelector("#select_dialect").value;

    // Callback Function for the onStart Event
    speechRecognition.onstart = () => {
        // Show the Status Element
        document.querySelector("#status").style.display = "block";
    };
    speechRecognition.onerror = () => {
        // Hide the Status Element
        document.querySelector("#status").style.display = "none";
    };
    speechRecognition.onend = async() => {
        const API_KEY = "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";
        const API_URL = "https://api.openai.com/v1/";

        const response = await fetch(API_URL + "completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: "text-davinci-003",
                prompt: final_transcript,
                temperature: 0.7,
                max_tokens: 256,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }),
        });
        const data = await response.json();
        const aiResponse = data.choices[0].text;
        const responseElement = document.querySelector("#response");
        responseElement.innerHTML = `<pre><code class="language-javascript">${aiResponse}</code></pre>`;

        Prism.highlightAll();
        new ClipboardJS('.copy-to-clipboard');

        const voiceAssistantCheckbox = document.querySelector("#voice-assistant-checkbox");
        if (voiceAssistantCheckbox.checked) {
            responsiveVoice.speak(data.choices[0].text);
        } else {
            // Checkbox is not checked, do something else...
        }
    };




    document.addEventListener("keydown", function(event) {
        if (event.code === "KeyS") {
            document.querySelector("#final").innerHTML = "";
            document.querySelector("#response").innerHTML = "";
            speechRecognition.start();
        }
        if (event.code === "KeyD") {

            document.querySelector("#status").style.display = "none";
            speechRecognition.stop();
        }
    });

    window.addEventListener('beforeunload', (event) => {
        // Stop the ResponsiveVoice speech synthesis
        responsiveVoice.cancel();
    });

    speechRecognition.onresult = (event) => {
        // Create the interim transcript string locally because we don't want it to persist like final transcript
        let interim_transcript = "";

        // Loop through the results from the speech recognition object.
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            // If the result item is Final, add it to Final Transcript, Else add it to Interim transcript
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }

        // Set the Final transcript and Interim transcript.
        document.querySelector("#final").innerHTML = final_transcript;
        document.querySelector("#interim").innerHTML = interim_transcript;
    };

    // Set the onClick property of the start button
    document.querySelector("#start").onclick = () => {
        // Start the Speech Recognition
        document.querySelector("#final").innerHTML = "";
        document.querySelector("#response").innerHTML = "";
        speechRecognition.start();
    };
    // Set the onClick property of the stop button
    document.querySelector("#stop").onclick = () => {
        // Stop the Speech Recognition
        document.querySelector("#status").style.display = "none";
        speechRecognition.stop();

    };
} else {
    alert("The AI assisstant is not available on this browser, please try another one.");
}