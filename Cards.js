var cards = {}

cards.adaptiveCard = {
    contentType: "application/vnd.microsoft.card.adaptive",
    content: {
"$schema": "http://adaptivecards.io/schemas/adaptive-card.json", 
"type": "AdaptiveCard", 
"body": [ 
    { 
        "type": "Container", 
        "speak": "<s>Card created by Renee Dothard: Insurance Card schema</s>", 
        "items": [ 
            { 
                "type": "TextBlock", 
                "text": "Card created: Publish Adaptive Card schema for Insurance", 
                "weight": "bolder", 
                "size": "medium" 
            }, 
            { 
                "type": "ColumnSet", 
                "columns": [ 
                    { 
                        "type": "Column", 
                        "size": "auto", 
                        "items": [ 
                            { 
                                "type": "Image", 
                                "url": "https://http://www.clipproject.info/images/joomgallery/originals/people_35/aunt_clipart_-_people_clip_art_free_20121124_1587035614.gif", 
                                "size": "small", 
                                "style": "person" 
                            } 
                        ] 
                    }, 
                    { 
                        "type": "Column", 
                        "size": "stretch", 
                        "items": [ 
                            { 
                                "type": "TextBlock", 
                                "text": "**Renee Dothard**", 
                                "wrap": true 
                            }, 
                            { 
                                "type": "TextBlock", 
                                "separation": "none", 
                                "text": "Created {{DATE(2017-09-11T06:08:39Z,Long)}} {{TIME(2017-09-11T11:21:39Z)}}", 
                                "isSubtle": true, 
                                "wrap": true 
                            } 
                        ] 
                    } 
                ] 
            } 
        ] 
    }, 
    { 
        "type": "Container", 
        "items": [ 
            { 
                "type": "TextBlock", 
                "text": "Welcome, Renee to the insurance claims bot. Let's get started by selecting one of the options below that I can assist you with.", 
                "speak": "", 
                "wrap": true 
            }, 
            { 
                "type": "FactSet", 
                "speak": "It has been assigned to: David Claux", 
                "facts": [ 
                    { 
                        "title": "Small Business:", 
                        "value": "Policy Number  123456" 
                    }, 
                    { 
                        "title": "Coverage Type:", 
                        "value": "Liability and Flood" 
                    }, 
                    { 
                        "title": "Policy Owner:", 
                        "value": "Renee Dothard" 
                    }, 
                    { 
                        "title": "Effective Date:", 
                        "value": "09/01/2017" 
                    } 
                ] 
            } 
        ] 
    } 
], 
"actions": [ 
    { 
        "type": "Action.ShowCard", 
        "title": "Make a new claim", 
        "card": { 
            "type": "AdaptiveCard", 
            "body": [ 
                { 
                    "type": "Input.Date", 
                    "id": "dueDate", 
                    "title": "Select due date" 
                } 
            ], 
            "actions": [ 
                { 
                    "type": "Action.Http", 
                    "title": "OK", 
                    "url": "http://xyz.com", 
                    "headers": { 
                        "content-type": "application/json" 
                    }, 
                    "body": "{ 'comment' : '{{comment.value}}' }" 
                } 
            ] 
        } 
    }, 
    { 
        "type": "Action.ShowCard", 
        "title": "Check status on existing claim", 
        "card": { 
            "type": "AdaptiveCard", 
            "body": [ 
                { 
                    "type": "Input.Text", 
                    "id": "comment", 
                    "isMultiline": true, 
                    "placeholder": "Enter your comment" 
                } 
            ], 
            "actions": [ 
                { 
                    "type": "Action.Http", 
                    "method": "POST", 
                    "title": "OK", 
                    "url": "http://xyz.com", 
                    "headers": { 
                        "content-type": "application/json" 
                    }, 
                    "body": "{ 'comment' : '{{comment.value}}' }" 
                } 
            ] 
        } 
    }, 
    { 
        "type": "Action.OpenUrl", 
        "title": "Have an agent contact me", 
        "url": "https://www.allianz.com/en/press/press_service/press-offices/"
    }
]}}

module.exports = cards;