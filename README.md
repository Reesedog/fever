# FEVER
An AI assistant that can tell if a statement contradicts the knowledge base.
Currently it is working as a NDIS plan making assistant for demo



## Deployment

1. **Dependency Install**
   - 🚧The requirement.txt is not finished because I am lazy
   - Backend:
     
     ```bash
     cd fever_backend/
     source ~/myenv/bin/activate
     pip install -r requirements.txt
     ```
   - Frontend:
    
     ```bash
     cd frontend/
     npm install
     ```

2. **DB Migration**
   - Database:
     
     ```bash
     python3 manage.py makemigrations
     python3 manage.py migrate
     ```
    
4. **Start Server**
   - Backend:
     
     ```bash
     cd fever_backend/
     source ~/myenv/bin/activate
     python3 manage.py runserver
     ```
   - Frontend:
     
     ```bash
     cd frontend/
     npm start
     ```



