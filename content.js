console.log("Email extension loaded");


// ============================================
// 1. CREATE AI REPLY BUTTON
// ============================================

function createAIButton() {

    const button = document.createElement('div');

    button.className =
        'T-I-J-J5 aoO v7 T-I-atl L3 ai-reply-button';

    button.style.marginRight = '8px';

    button.innerHTML = 'AI Reply';
   
    button.setAttribute('role', 'button');

    button.setAttribute(
        'data-tooltip',
        'Generate AI Reply'
    );

    return button;
}


// ============================================
// 2. FIND ACTIVE COMPOSE BOX
// ============================================

function getActiveComposeBox() {

    const composeBoxes = Array.from(
        document.querySelectorAll(
            '[role="textbox"][g_editable="true"]'
        )
    );

    // Find the visible compose box
    const activeBox = composeBoxes.find(
        box => box.offsetParent !== null
    );

    return activeBox || null;
}


// ============================================
// 3. GET ORIGINAL EMAIL CONTENT
// ============================================

function getOriginalEmailContent(composeBox) {

    const emailElements = Array.from(
        document.querySelectorAll('.a3s.aiL')
    );

    const visibleEmails = emailElements.filter(
        element => {

            if (element.offsetParent === null) {
                return false;
            }

            // Don't use anything inside the compose window
            if (composeBox &&
                element.contains(composeBox)) {
                return false;
            }

            if (composeBox &&
                composeBox.contains(element)) {
                return false;
            }

            return true;
        }
    );


    if (visibleEmails.length === 0) {
        return '';
    }


    // Use the latest visible email
    const lastEmail =
        visibleEmails[visibleEmails.length - 1];


    return lastEmail.innerText.trim();
}


// ============================================
// 4. FIND ACTIVE COMPOSE TOOLBAR
// ============================================

function findComposeToolbar() {

    const sendButtons = Array.from(
        document.querySelectorAll('[data-tooltip]')
    ).filter(button =>
        (button.getAttribute('data-tooltip') || '')
            .toLowerCase()
            .includes('send')
    );


    // Find visible Send button
    const activeSendButton =
        sendButtons.find(
            button => button.offsetParent !== null
        );


    if (!activeSendButton) {

        console.log(
            "Active Send button not found"
        );

        return null;
    }


    // Send button is inside .gU.Up
    const toolbar =
        activeSendButton.closest('.gU.Up');


    if (toolbar) {

        console.log(
            "Compose toolbar found"
        );

        return toolbar;
    }


    console.log(
        "Compose toolbar not found"
    );

    return null;
}


// ============================================
// 5. INSERT AI BUTTON
// ============================================

function injectButton() {

    // Remove previous AI button
    const existingButton =
        document.querySelector('.ai-reply-button');

    if (existingButton) {
        existingButton.remove();
    }


    // Find Gmail toolbar
    const toolbar =
        findComposeToolbar();


    if (!toolbar) {

        console.log(
            "Toolbar not found"
        );

        return;
    }


    console.log(
        "Toolbar found, creating AI Button"
    );


    // Create button
    const button =
        createAIButton();


    // ========================================
    // 6. AI REPLY BUTTON CLICK
    // ========================================

    button.addEventListener(
        'click',
        async () => {

            try {

                // ====================================
                // FIND ACTIVE COMPOSE BOX
                // ====================================

                const composeBox =
                    getActiveComposeBox();


                if (!composeBox) {

                    alert(
                        'Compose box was not found'
                    );

                    return;
                }


                // ====================================
                // GET USER'S INSTRUCTION
                // ====================================

                const userPrompt =
                    composeBox.innerText.trim();


                if (!userPrompt) {

                    alert(
                        'Please write your instruction in the email body first.'
                    );

                    return;
                }


                console.log(
                    "User instruction:"
                );

                console.log(
                    userPrompt
                );


                // ====================================
                // GET ORIGINAL EMAIL
                // ====================================

                const emailContent =
                    getOriginalEmailContent(
                        composeBox
                    );


                console.log(
                    "Original email:"
                );

                console.log(
                    emailContent
                );


                // ====================================
                // SHOW LOADING
                // ====================================

                button.innerHTML =
                    'Generating...';


                button.style.pointerEvents =
                    'none';


                // ====================================
                // CALL SPRING BOOT
                // ====================================

                const response =
                    await fetch(
                        'http://localhost:8080/api/email/generate',
                        {
                            method: 'POST',

                            headers: {
                                'Content-Type':
                                    'application/json'
                            },

                            body: JSON.stringify({

                                // Original email.
                                // Empty for new compose.
                                emailContent:
                                    emailContent,

                                // Default tone
                                tone:
                                    'professional',

                                // What user typed
                                prompt:
                                    userPrompt
                            })
                        }
                    );


                // ====================================
                // CHECK RESPONSE
                // ====================================

                if (!response.ok) {

                    const errorText =
                        await response.text();

                    console.error(
                        "Backend error:",
                        errorText
                    );

                    throw new Error(
                        'API Request Failed: ' +
                        response.status
                    );
                }


                // ====================================
                // GET GENERATED EMAIL
                // ====================================

                const generatedReply =
                    await response.text();


                console.log(
                    "Generated Reply:"
                );

                console.log(
                    generatedReply
                );


                // ====================================
                // REPLACE USER PROMPT
                // WITH GENERATED EMAIL
                // ====================================

                composeBox.focus();


                // Select everything inside compose box
                document.execCommand(
                    'selectAll',
                    false,
                    null
                );


                // Replace selected text
                document.execCommand(
                    'insertText',
                    false,
                    generatedReply
                );


                console.log(
                    "AI reply inserted successfully"
                );

            } catch (error) {

                console.error(
                    "AI Reply Error:",
                    error
                );


                alert(
                    'Failed to generate email. Please try again.'
                );

            } finally {

                // Restore button
                button.innerHTML =
                    'AI Reply';

                button.style.pointerEvents =
                    'auto';
            }
        }
    );


    // ========================================
    // 7. INSERT BUTTON
    // ========================================

    toolbar.insertBefore(
        button,
        toolbar.firstChild
    );


    console.log(
        "AI Reply button inserted"
    );
}


// ============================================
// 8. WATCH FOR GMAIL COMPOSE WINDOW
// ============================================

const observer =
    new MutationObserver(
        (mutations) => {

            for (const mutation of mutations) {

                const addedNodes =
                    Array.from(
                        mutation.addedNodes
                    );


                const hasComposeElements =
                    addedNodes.some(
                        node =>
                            node.nodeType ===
                                Node.ELEMENT_NODE &&
                            (
                                node.matches(
                                    '.aDh, .btC, [role="textbox"]'
                                ) ||
                                node.querySelector(
                                    '.aDh, .btC, [role="textbox"]'
                                )
                            )
                    );


                if (hasComposeElements) {

                    console.log(
                        "Compose Window Detected"
                    );


                    setTimeout(
                        injectButton,
                        500
                    );
                }
            }
        }
    );


// ============================================
// 9. START OBSERVER
// ============================================

observer.observe(
    document.body,
    {
        childList: true,
        subtree: true
    }
);





// console.log("Email extension loaded");


// // ============================================
// // 1. CREATE AI REPLY BUTTON
// // ============================================

// function createAIButton() {

//     const button = document.createElement('div');

//     button.className =
//         'T-I-J-J5 aoO v7 T-I-atl L3 ai-reply-button';

//     button.style.marginRight = '8px';

//     button.innerHTML = 'AI Reply';

//     button.setAttribute('role', 'button');

//     button.setAttribute(
//         'data-tooltip',
//         'Generate AI Reply'
//     );

//     return button;
// }


// // ============================================
// // 2. GET EXISTING EMAIL CONTENT
// // ============================================

// function getEmailContent() {

//     const selectors = [
//         '.h7',
//         '.a3s.aiL',
//         '.gmail_quote',
//         '[role="presentation"]'
//     ];

//     for (const selector of selectors) {

//         const content =
//             document.querySelector(selector);

//         if (content) {

//             const text =
//                 content.innerText.trim();

//             if (text) {
//                 return text;
//             }
//         }
//     }

//     // No existing email found
//     return '';
// }


// // ============================================
// // 3. FIND ACTIVE COMPOSE TOOLBAR
// // ============================================

// function findComposeToolbar() {

//     // Find all Gmail Send buttons
//     const sendButtons = Array.from(
//         document.querySelectorAll('[data-tooltip]')
//     ).filter(button =>
//         (button.getAttribute('data-tooltip') || '')
//             .toLowerCase()
//             .includes('send')
//     );


//     // Find the visible Send button
//     const activeSendButton = sendButtons.find(
//         button => button.offsetParent !== null
//     );


//     if (!activeSendButton) {

//         console.log(
//             "Active Send button not found"
//         );

//         return null;
//     }


//     // Send button is inside .gU.Up
//     const toolbar =
//         activeSendButton.closest('.gU.Up');


//     if (toolbar) {

//         console.log(
//             "Compose toolbar found"
//         );

//         return toolbar;
//     }


//     console.log(
//         "Compose toolbar not found"
//     );

//     return null;
// }


// // ============================================
// // 4. INSERT AI BUTTON
// // ============================================

// function injectButton() {

//     // Remove existing AI button
//     const existingButton =
//         document.querySelector('.ai-reply-button');

//     if (existingButton) {
//         existingButton.remove();
//     }


//     // Find compose toolbar
//     const toolbar =
//         findComposeToolbar();


//     if (!toolbar) {

//         console.log(
//             "Toolbar not found"
//         );

//         return;
//     }


//     console.log(
//         "Toolbar found, creating AI Button"
//     );


//     // Create AI button
//     const button =
//         createAIButton();


//     // ========================================
//     // 5. AI BUTTON CLICK
//     // ========================================

//     button.addEventListener(
//         'click',
//         async () => {

//             try {

//                 // Ask user for instruction
//                 const userPrompt =
//                     window.prompt(
//                         "What should the AI reply say?"
//                     );


//                 // User clicked Cancel or entered nothing
//                 if (!userPrompt ||
//                     !userPrompt.trim()) {

//                     return;
//                 }


//                 // Show loading state
//                 button.innerHTML =
//                     'Generating...';


//                 // ====================================
//                 // GET EXISTING EMAIL
//                 // ====================================

//                 const emailContent =
//                     getEmailContent();


//                 console.log(
//                     "Email content:",
//                     emailContent
//                 );


//                 console.log(
//                     "User prompt:",
//                     userPrompt
//                 );


//                 // ====================================
//                 // CALL SPRING BOOT BACKEND
//                 // ====================================

//                 const response =
//                     await fetch(
//                         'http://localhost:8080/api/email/generate',
//                         {
//                             method: 'POST',

//                             headers: {
//                                 'Content-Type':
//                                     'application/json'
//                             },

//                             body: JSON.stringify({

//                                 // Existing email.
//                                 // Can be empty for new emails.
//                                 emailContent:
//                                     emailContent,

//                                 // Tone
//                                 tone:
//                                     'professional',

//                                 // User's instruction
//                                 prompt:
//                                     userPrompt
//                             })
//                         }
//                     );


//                 // ====================================
//                 // CHECK API RESPONSE
//                 // ====================================

//                 if (!response.ok) {

//                     throw new Error(
//                         'API Request Failed: ' +
//                         response.status
//                     );
//                 }


//                 // ====================================
//                 // GET GENERATED REPLY
//                 // ====================================

//                 const generatedReply =
//                     await response.text();


//                 console.log(
//                     "Generated Reply:"
//                 );

//                 console.log(
//                     generatedReply
//                 );


//                 // ====================================
//                 // FIND ACTIVE COMPOSE BOX
//                 // ====================================

//                 const composeBoxes =
//                     Array.from(
//                         document.querySelectorAll(
//                             '[role="textbox"][g_editable="true"]'
//                         )
//                     );


//                 // Find visible compose box
//                 const composeBox =
//                     composeBoxes.find(
//                         box =>
//                             box.offsetParent !== null
//                     );


//                 if (!composeBox) {

//                     console.error(
//                         "Compose box was not found"
//                     );

//                     alert(
//                         'Compose box was not found'
//                     );

//                     return;
//                 }


//                 // ====================================
//                 // INSERT GENERATED EMAIL
//                 // ====================================

//                 composeBox.focus();


//                 document.execCommand(
//                     'insertText',
//                     false,
//                     generatedReply
//                 );


//                 console.log(
//                     "AI reply inserted successfully"
//                 );


//             } catch (error) {

//                 console.error(
//                     "AI Reply Error:",
//                     error
//                 );


//                 alert(
//                     'Failed to generate email. Please try again.'
//                 );


//             } finally {

//                 // Restore button text
//                 button.innerHTML =
//                     'AI Reply';
//             }
//         }
//     );


//     // ========================================
//     // 6. ADD BUTTON TO GMAIL TOOLBAR
//     // ========================================

//     toolbar.insertBefore(
//         button,
//         toolbar.firstChild
//     );


//     console.log(
//         "AI Reply button inserted"
//     );
// }


// // ============================================
// // 7. WATCH FOR GMAIL COMPOSE WINDOW
// // ============================================

// const observer =
//     new MutationObserver(
//         (mutations) => {

//             for (const mutation of mutations) {

//                 const addedNodes =
//                     Array.from(
//                         mutation.addedNodes
//                     );


//                 const hasComposeElements =
//                     addedNodes.some(
//                         node =>
//                             node.nodeType ===
//                                 Node.ELEMENT_NODE &&
//                             (
//                                 node.matches(
//                                     '.aDh, .btC, [role="textbox"]'
//                                 ) ||
//                                 node.querySelector(
//                                     '.aDh, .btC, [role="textbox"]'
//                                 )
//                             )
//                     );


//                 if (hasComposeElements) {

//                     console.log(
//                         "Compose Window Detected"
//                     );


//                     // Wait for Gmail DOM
//                     // to finish loading
//                     setTimeout(
//                         injectButton,
//                         500
//                     );
//                 }
//             }
//         }
//     );


// // ============================================
// // 8. START OBSERVER
// // ============================================

// observer.observe(
//     document.body,
//     {
//         childList: true,
//         subtree: true
//     }
// );
















// pop()//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// console.log("Email extension loaded");


// // ============================================
// // 1. CREATE AI REPLY BUTTON
// // ============================================

// function createAIButton() {

//     const button = document.createElement('div');

//     button.className =
//         'T-I-J-J5 aoO v7 T-I-atl L3 ai-reply-button';

//     button.style.marginRight = '8px';

//     button.innerHTML = 'AI Reply';

//     button.setAttribute('role', 'button');

//     button.setAttribute(
//         'data-tooltip',
//         'Generate AI Reply'
//     );

//     return button;
// }


// // ============================================
// // 2. GET EMAIL CONTENT
// // ============================================

// function getEmailContent() {

//     const selectors = [
//         '.h7',
//         '.a3s.aiL',
//         '.gmail_quote',
//         '[role="presentation"]'
//     ];

//     for (const selector of selectors) {

//         const content =
//             document.querySelector(selector);

//         if (content) {

//             return content.innerText.trim();
//         }
//     }

//     return null;
// }


// // ============================================
// // 3. FIND ACTIVE COMPOSE TOOLBAR
// // ============================================

// function findComposeToolbar() {

//     // Find all Gmail Send buttons
//     const sendButtons = Array.from(
//         document.querySelectorAll('[data-tooltip]')
//     ).filter(button =>
//         (button.getAttribute('data-tooltip') || '')
//             .toLowerCase()
//             .includes('send')
//     );


//     // Find the visible Send button
//     const activeSendButton = sendButtons.find(
//         button => button.offsetParent !== null
//     );


//     if (!activeSendButton) {

//         console.log(
//             "Active Send button not found"
//         );

//         return null;
//     }


//     // The Send button is inside .gU.Up
//     const toolbar =
//         activeSendButton.closest('.gU.Up');


//     if (toolbar) {

//         console.log(
//             "Compose toolbar found"
//         );

//         return toolbar;
//     }


//     console.log(
//         "Compose toolbar not found"
//     );

//     return null;
// }


// // ============================================
// // 4. INSERT AI BUTTON
// // ============================================

// function injectButton() {

//     // Remove old AI button if it already exists
//     const existingButton =
//         document.querySelector('.ai-reply-button');

//     if (existingButton) {

//         existingButton.remove();
//     }


//     // Find Gmail compose toolbar
//     const toolbar =
//         findComposeToolbar();


//     if (!toolbar) {

//         console.log(
//             "Toolbar not found"
//         );

//         return;
//     }


//     console.log(
//         "Toolbar found, creating AI Button"
//     );


//     // Create AI button
//     const button =
//         createAIButton();


//     // ========================================
//     // AI BUTTON CLICK
//     // ========================================
//     button.addEventListener(
//     'click',
//     async () => {

//         try {

//             const userPrompt = window.prompt(
//                 "What should the AI reply say?"
//             );

//             if (!userPrompt) {
//                 return;
//             }

//             button.innerHTML = 'Generating...';

//             const emailContent = getEmailContent();

//             if (!emailContent) {
//                 alert('Could not find email content');
//                 return;
//             }

//             // continue with your fetch...
//     // button.addEventListener(
//     //     'click',
//     //     async () => {

//     //         try {
                
//     //             // Show loading text
//     //             button.innerHTML =
//     //                 'Generating...';


//     //             // Get original email
//     //             const emailContent =
//     //                 getEmailContent();


//     //             if (!emailContent) {

//     //                 alert(
//     //                     'Could not find email content'
//     //                 );

//     //                 return;
//     //             }


//                 console.log(
//                     "Email content found:"
//                 );

//                 console.log(
//                     emailContent
//                 );


//                 // ====================================
//                 // CALL SPRING BOOT BACKEND
//                 // ====================================

//                 const response =
//                     await fetch(
//                         'http://localhost:8080/api/email/generate',
//                         {
//                             method: 'POST',

//                             headers: {
//                                 'Content-Type':
//                                     'application/json'
//                             },

//                             body: JSON.stringify({

//                                 emailContent:
//                                     emailContent,

//                                 tone:
//                                     'professional',
//                                 prompt: userPrompt   
//                             })
//                         }
//                     );


//                 // Check API response
//                 if (!response.ok) {

//                     throw new Error(
//                         'API Request Failed: ' +
//                         response.status
//                     );
//                 }


//                 // Get generated reply
//                 const generatedReply =
//                     await response.text();


//                 console.log(
//                     "Generated Reply:"
//                 );

//                 console.log(
//                     generatedReply
//                 );


//                 // ====================================
//                 // FIND GMAIL COMPOSE BOX
//                 // ====================================

//                 const composeBoxes =
//                     Array.from(
//                         document.querySelectorAll(
//                             '[role="textbox"][g_editable="true"]'
//                         )
//                     );


//                 // Find visible compose box
//                 const composeBox =
//                     composeBoxes.find(
//                         box =>
//                             box.offsetParent !== null
//                     );


//                 if (composeBox) {

//                     composeBox.focus();


//                     // Insert generated reply
//                     document.execCommand(
//                         'insertText',
//                         false,
//                         generatedReply
//                     );


//                     console.log(
//                         "AI reply inserted successfully"
//                     );

//                 } else {

//                     console.error(
//                         "Compose box was not found"
//                     );

//                     alert(
//                         'Compose box was not found'
//                     );
//                 }


//             } catch (error) {

//                 console.error(
//                     "AI Reply Error:",
//                     error
//                 );


//                 alert(
//                     'Failed to generate email'
//                 );


//             } finally {

//                 // Restore button text
//                 button.innerHTML =
//                     'AI Reply';
//             }
//         }
//     );


//     // ========================================
//     // INSERT BUTTON INTO TOOLBAR
//     // ========================================

//     toolbar.insertBefore(
//         button,
//         toolbar.firstChild
//     );


//     console.log(
//         "AI Reply button inserted"
//     );
// }


// // ============================================
// // 5. WATCH FOR GMAIL COMPOSE WINDOW
// // ============================================

// const observer =
//     new MutationObserver(
//         (mutations) => {

//             for (const mutation of mutations) {

//                 const addedNodes =
//                     Array.from(
//                         mutation.addedNodes
//                     );


//                 const hasComposeElements =
//                     addedNodes.some(
//                         node =>
//                             node.nodeType ===
//                                 Node.ELEMENT_NODE &&
//                             (
//                                 node.matches(
//                                     '.aDh, .btC, [role="textbox"]'
//                                 ) ||
//                                 node.querySelector(
//                                     '.aDh, .btC, [role="textbox"]'
//                                 )
//                             )
//                     );


//                 if (hasComposeElements) {

//                     console.log(
//                         "Compose Window Detected"
//                     );


//                     // Wait for Gmail DOM to finish loading
//                     setTimeout(
//                         injectButton,
//                         500
//                     );
//                 }
//             }
//         }
//     );


// // ============================================
// // 6. START OBSERVER
// // ============================================

// observer.observe(
//     document.body,
//     {
//         childList: true,
//         subtree: true
//     }
// );
