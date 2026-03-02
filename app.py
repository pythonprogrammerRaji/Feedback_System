from flask import Flask, render_template, request, redirect, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = "6eef810229497b18509eb2265906045f"


def get_db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

# Create table
def create_table():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstname TEXT,
            lastname TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    """)
    conn.commit()
    conn.close()

create_table()

@app.route("/")
def home():
    return redirect("/register")

@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        firstname = request.form["firstname"]
        lastname = request.form["lastname"]
        email = request.form["email"]
        password = request.form["password"]
        confirm = request.form["confirm_password"]

        if password != confirm:
            return render_template("register.html", message="Passwords do not match")

        hashed_password = generate_password_hash(password)

        try:
            conn = get_db()
            conn.execute("INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)",
                         (firstname, lastname, email, hashed_password))
            conn.commit()
            conn.close()
            return render_template("login.html", message="Successfully Registered. Please Login.")
        except:
            return render_template("register.html", message="Email already exists")

    return render_template("register.html")

# Login
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        conn = get_db()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        conn.close()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["id"]
            return redirect("/create")
        else:
            return render_template("login.html", message="Invalid Email or Password")

    return render_template("login.html")


@app.route("/create")
def create():
    return render_template("create_form.html")

@app.route("/forms")
def forms():
    return render_template("forms_list.html")

# @app.route("/submit")
# def submit():
#     return render_template("submit_form.html")

@app.route("/results")
def results():
    return render_template("results.html")

@app.route("/submit")
def submit():
    form_id = request.args.get("id")
    return render_template("submit_form.html", form_id=form_id)


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True)