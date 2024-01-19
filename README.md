# StackOverflow-backend
Made endpoints using Stackoverflow API - https://api.stackexchange.com/docs/

# URL for endpoint
Hit me - https://stackexchange-server.vercel.app/

# Supported endpoints are:
1. POST /questions/load
    - Loads questions from stackoverflow API to local database

2. GET /questions
    - Returns all questions froom local database
    - Parameters:
        - is_answered : boolean(true or false)
        - tags : String "," separated list of tags
        - answers_count [__gt , __lt , __gte , __lte] : number
        - sort : String
            - Trending: sort=score(Based on score)
            - Latest: sort=created_at(Based on created_at)
        - page : Number requested page number

3. GET /questions/:id
    - Returns a perticular questions associated with given id

4. POST /questions
    - Insert a new questions into the database Manually

5. PATCH /questions/:id
    - Updates the questions associated with given id

6. DELETE /questions/:id
    - Deletes the questions associated with given id
