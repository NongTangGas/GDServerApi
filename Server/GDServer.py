from flask import Flask, jsonify, request, g
from flask_cors import CORS
import pymysql
from werkzeug.utils import secure_filename
import os
import mysql.connector
import csv


app = Flask(__name__)
CORS(app)

def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(
            host='127.0.0.1',
            user='root',
            password='Taotong',
            database='grader',
        )
    return g.db

@app.before_request
def before_request():
    g.db = get_db()

@app.teardown_request
def teardown_request(exception=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()
    
UPLOAD_FOLDER = 'C:/Users/B/Desktop/Project CU/UploadFile'

""" Global API + Function """
### Add a Student in grader
def AddUserGrader(SID, Email, Name):
    try:
        # Connect to database
        db = get_db()
        cursor = db.cursor()

        # Execute INSERT query
        insert_user = "INSERT INTO user (EmailName, Email, Name) VALUES (%s, %s, %s)"
        cursor.execute(insert_user, (SID, Email, Name))

        # Commit the transaction
        db.commit()

        # Close cursor and database connection
        cursor.close()
        db.close()

        # Return success response
        return True
    except Exception as e:
        # Rollback the transaction in case of an error
        db.rollback()
        # Close cursor and database connection
        cursor.close()
        db.close()
        # Return error response
        return False
    
### Add a User in class
def AddUserClass(UserEmail, ClassID, SchoolYear, Section):
    try:
        conn = get_db()
        cursor = conn.cursor()

        # Execute the SQL query to fetch the IDClass
        query_getclass = """
            SELECT DISTINCT ID
            FROM Class
            WHERE ClassID = %s AND Section = %s AND SchoolYear = %s
        """
        cursor.execute(query_getclass, (ClassID, Section, SchoolYear))
        id_class = cursor.fetchone()

        if id_class:
            # Execute the SQL query to add the user to the class
            query_insertUSC = """
                INSERT INTO userclass (Email, IDClass)
                VALUES (%s, %s)
            """
            cursor.execute(query_insertUSC, (UserEmail, id_class[0]))
            conn.commit()
            return True  # Return True if user added successfully
        else:
            return False  # Return False if class not found

    except Exception as e:
        return False  # Return False if an error occurred
    finally:
        cursor.close()
        conn.close()
        
### Read CSV
def ReadCSV(ClassID, SchoolYear):
    SYFile = SchoolYear.replace("/", "T")
    UPLOAD_FOLDER = 'C:/Users/B/Desktop/Project CU/UploadFile/CSV'
    filename = ClassID + "-" + SYFile + ".csv"
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    try:
        with open(file_path, newline='') as csvfile:
            reader = csv.reader(csvfile)
            # Skip the header row if it exists
            next(reader, None)
            for row in reader:
                # Assuming the CSV columns are SID, Name, and Section
                SID, Name, Section = row
                # Concatenate "@student.chula.ac.th" to the end of each SID to form an Email
                Email = SID + "@student.chula.ac.th"
                # Call your functions to add data to the database
                AddUserGrader(SID, Email, Name)
                AddUserClass(Email, ClassID, SchoolYear, Section)
    except FileNotFoundError:
        print(f"File {file_path} not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

 
### get classes by Email       
@app.route('/class/classes', methods=['GET'])
def get_classesdata():
    try:
        #Param
        EmailR = request.args.get('Email')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
            	CLS.ID,
            	CLS.Name,
                CLS.ClassID,
                CLS.Section,
                CLS.SchoolYear,
                CLS.Thumbnail
            FROM
            	class CLS
                INNER JOIN userclass USC ON USC.IDClass = CLS.ID
            WHERE
                USC.EMAIL = %s
            ORDER BY
	            CLS.SchoolYear DESC;
        """

        # Execute a SELECT statement
        cur.execute(query,(EmailR))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = []
        for row in data:
            id, name, class_id, section, school_year, thumbnail = row
            transformed_data.append({
                "ClassID": class_id,
                "ClassName": name,
                "ID": id,
                "SchoolYear": school_year,
                "Section": section,
                "Thumbnail": thumbnail
            })
            
        return jsonify(transformed_data)

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500
    

    


if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
# Create the upload directory if it doesn't exist

###Upload turnin assignment
@app.route("/upload", methods=["POST"])
def upload_file():
    uploaded_file = request.files["file"]

    if uploaded_file.filename != "":
        # Securely generate a unique filename
        filename = secure_filename(uploaded_file.filename)
        # Construct the full path to the file
        filepath = os.path.join(UPLOAD_FOLDER,'TurnIn',filename)

        try:
            # Save the file
            uploaded_file.save(filepath)
            # Return a success message
            return jsonify({"message": "File uploaded successfully!"})

        except Exception as e:
            # Handle any exceptions during file saving gracefully
            print("Error saving file: {e}")
            return jsonify({"error": "An error occurred while uploading the file."}), 500

""" STUDENT API """
### get all profile info by Email
@app.route('/ST/user/profile', methods=['GET'])
def get_userprofile():
    try:
        #Param
        EmailR = request.args.get('Email')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
            	USR.EmailName,
                USR.Email,
                USR.Name,
                USR.Role
            FROM
            	user USR
            WHERE
            	USR.Email = %s
        """

        # Execute a SELECT statement
        cur.execute(query,(EmailR))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = {}
        for row in data:
            Ename, Email, Name, Role = row
            transformed_data = {
                    'Name': Name,
                    'Email': Email,
                    'Profile': Ename,
                    'Role': Role
                }
            
        return jsonify(transformed_data)

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500

### get all assignment in class 
@app.route('/ST/assignment/all', methods=['GET'])
def get_all():
    try:
        
        #Param
        class_id = request.args.get('class_id')
        school_year = request.args.get('school_year')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
            	QST.LAB,
                QST.Question,
                LB.Name,
                ASN.DueTime,
                SMT.TimeStamp,
                CASE WHEN SMT.TimeStamp IS NOT NULL THEN TRUE ELSE FALSE END As TurnIn,
            	CASE WHEN ASN.DueTime <= SMT.TimeStamp THEN TRUE ELSE FALSE END AS Late
            FROM
            	question QST
                INNER JOIN assign ASN ON QST.LAB = ASN.LAB
                INNER JOIN submitted SMT ON QST.LAB = SMT.LAB AND QST.Question = SMT.Question
                RIGHT JOIN lab LB ON QST.LAB = LB.LAB 
            WHERE
            	QST.ClassID = %s
                AND QST.SchoolYear = %s
                AND QST.ClassID = ASN.ClassID AND ASN.ClassID = SMT.ClassID AND SMT.SchoolYear = LB.SchoolYear
                AND QST.SchoolYear = ASN.SchoolYear AND ASN.SchoolYear = SMT.SchoolYear AND SMT.SchoolYear = LB.SchoolYear
            ORDER BY
            	QST.LAB ASC, QST.Question ASC;
                 """

        # Execute a SELECT statement
        cur.execute(query, (class_id, school_year))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = {}
        for row in data:
            lab, question, name, due_time, timestamp, turn_in, late = row
            lab = 'Lab'+str(lab)
            question = 'Q'+str(question)
        
            if lab not in transformed_data:
                transformed_data[lab] = {
                    'Name':name,
                    'Due':due_time,
                }
        
            if question not in transformed_data[lab]:
                transformed_data[lab][question]={
                    'IsTurnIn':bool(turn_in),
                    'IsLate':bool(late)
                    
                }

        return jsonify({'Assignment': transformed_data})

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500

### get specific lab 
@app.route('/ST/assignment/specific', methods=['GET'])
def get_speclab():
    try:
        
        #Param
        class_id = request.args.get('class_id')
        speclab = request.args.get('speclab')
        school_year = request.args.get('school_year')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
            	QST.LAB,
                LB.Name,
                QST.ID,
                QST.Question,
                ASN.DueTime,
                SMT.TimeStamp,
                SMT.Score,
                QST.MaxScore,
                SMT.PathToFile AS TurnInFile,
                ADF.PathToFile AS QuestionFile
            FROM
            	question QST
                INNER JOIN assign ASN ON QST.LAB = ASN.LAB
                INNER JOIN submitted SMT ON QST.LAB = SMT.LAB AND QST.Question = SMT.Question
                INNER JOIN addfile ADF ON QST.LAB =ADF.LAB
                INNER JOIN lab LB ON QST.LAB = LB.LAB 
            WHERE
            	QST.ClassID = %s
                AND QST.LAB = %s
                AND QST.SchoolYear = %s
                AND QST.ClassID = ASN.ClassID AND ASN.ClassID = SMT.ClassID AND SMT.ClassID = LB.ClassID
                AND QST.SchoolYear = ASN.SchoolYear AND ASN.SchoolYear = SMT.SchoolYear AND SMT.SchoolYear = LB.SchoolYear
            ORDER BY
            	QST.LAB ASC, QST.Question ASC;
                    """

        # Execute a SELECT statement
        cur.execute(query,(class_id,speclab,school_year))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data_list = []
        
        for row in data:
            lab, lab_name, question_id, question, due_time, submission_time, score, max_score, turn_in_file, question_file = row
            lab_num = 'Lab' + str(lab)
        
            # Construct the question key
            question_key = 'Q' + str(question)
        
            # Check if lab_num already exists in transformed_data_list
            lab_exists = False
            for item in transformed_data_list:
                if item['Lab'] == lab_num:
                    lab_exists = True
                    lab_data = item
                    break
                
            # If lab_num doesn't exist, create it
            if not lab_exists:
                lab_data = {
                    'Lab': lab_num,
                    'Name': lab_name,
                    'Due': due_time,
                    'Files':[],
                    'Questions': {}
                }
                transformed_data_list.append(lab_data)
        
            # Initialize the question key if it doesn't exist
            if question_key not in lab_data['Questions']:
                lab_data['Questions'][question_key] = {
                    'ID': question_id,
                    'QuestionNum': question,
                    'Submission': {
                        'Date': submission_time,
                        'FileName': turn_in_file,
                        },
                    'Score': score,
                    'MaxScore': max_score
                }
        
            if question_file not in lab_data['Files']:
                lab_data['Files'].append(question_file)
        
        # jsonify the transformed data list
        return jsonify(transformed_data_list[0])


    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500
    
""" TA API """
#Save CSV(Create and Edit Class)
def save_csv_file(ClassID, SchoolYear, file):
    if file and file.filename != '':
        try:
            
            filename = f"{ClassID}-{SchoolYear}{os.path.splitext(file.filename)[1]}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'CSV', filename)
            file.save(filepath)
            return True, os.path.join('File1', filename)  # Success flag and relative path
        except Exception as e:
            print(f"Error saving CSV file: {e}")
            return False, None  # Return False if saving failed
    return True, None  # Return True if no file to save

#Save Thumbnail(Create and Edit Class)
def save_thumbnail_file(file):
    if file and file.filename != '':
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], 'Thumbnail', filename)
            file.save(filepath)
            return True, filename  # Success flag and filename
        except Exception as e:
            print(f"Error saving thumbnail file: {e}")
            return False, None  # Return False if saving failed
    return True, None  # Return True if no file to save

@app.route("/TA/class/create", methods=["POST"])
def create_class():
    DataJ = request.get_json()

    ClassName = DataJ.get('ClassName')
    ClassID = DataJ.get('ClassID')
    SchoolYear = DataJ.get('SchoolYear')
    Creator = DataJ.get('Creator')
    Section = '0'
    
    # Prepare data for database insertion
    CLS_data = (ClassName, ClassID, Section, SchoolYear)

    
    try:
        # Establish MySQL connection
        conn = get_db()
        cursor = conn.cursor()
            
        # Insert data into the class table
        insert_class_query = "INSERT INTO class (Name, ClassID, Section, SchoolYear) VALUES (%s, %s, %s, %s)"
        cursor.execute(insert_class_query, CLS_data)
        
        # Commit the transaction
        conn.commit()
        
        if AddUserClass(Creator, ClassID, SchoolYear, Section):
            return jsonify({"Status": True})
        else:
            return jsonify({"Status": False})

    except mysql.connector.Error as error:
        # Rollback transaction in case of an error
        conn.rollback()
        return jsonify({"Status": False})

    finally:
        # Close the cursor and MySQL connection
        if 'cursor' in locals() and cursor:
            cursor.close()
            
            
#นักเรียนลด/ถอน => 1.ลบคะแนน SMT 2.ลบชั้นเรียน USC
#result = delete_student_data(student_id)
#if result:
#    print("Data deleted successfully!")
#else:
#    print("Failed to delete data.")
def delete_student_data(StudentID):
    conn = get_db()
    cursor = conn.cursor()
    
    try:
        # Begin transaction
        conn.start_transaction()
        
        # SQL query to delete data from submitted table
        delete_query_1 = """
            DELETE SMT
            FROM submitted SMT
            INNER JOIN userclass USC ON SMT.StudentID = LEFT(USC.Email, 10)
            WHERE SMT.studentID = %s
        """
        cursor.execute(delete_query_1, (StudentID,))
        
        # SQL query to delete data from userclass table
        delete_query_2 = """
            DELETE USC
            FROM userclass USC
            INNER JOIN submitted SMT ON SMT.StudentID = LEFT(USC.Email, 10)
            WHERE SMT.studentID = %s
        """
        cursor.execute(delete_query_2, (StudentID,))
        
        # Commit the transaction
        conn.commit()
        
        return True  # Return True if deletion is successful
    
    except mysql.connector.Error as error:
        # Rollback the transaction in case of an error
        conn.rollback()
        print("An error occurred while deleting data:", error)
        return False  # Return False if deletion fails
    
    finally:
        # Close cursor and connection
        cursor.close()
        conn.close()
            
            


@app.route("/TA/class/edit", methods=["POST"])
def edit_class():
    
    ClassID = request.form.get('ClassID')
    if not ClassID:
        return jsonify({"error": "ClassID is required."}), 400
    
    ClassName = request.form.get('ClassName')
    Section = request.form.get('Section')
    SchoolYear = request.form.get('SchoolYear')
    
    # Handle CSV file
    success_csv, PathToPicture1 = save_csv_file(ClassID, Section, SchoolYear, request.files.get('file1'))

    # Handle Thumbnail file
    success_thumbnail, PathToPicture2 = save_thumbnail_file(request.files.get('file2'))

    if not (success_csv and success_thumbnail):
        return jsonify({"error": "Failed to save one or more files."}), 500

    try:
        # Establish MySQL connection
        conn = get_db()
        cursor = conn.cursor()
        
        update_query = "UPDATE class SET Name = %s, Section = %s, SchoolYear = %s, PathToPicture1 = %s, PathToPicture2 = %s WHERE ClassID = %s"
        cursor.execute(update_query, (ClassName, Section, SchoolYear, PathToPicture1, PathToPicture2, ClassID))

        conn.commit()
        
        return jsonify({"message": "Class updated successfully!"})

    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"error": f"An error occurred while updating class: {error}"}), 500

    finally:
        if 'cursor' in locals() and cursor:
            cursor.close()
            
            
@app.route("/TA/assignmnet/create", methods=["POST"])
def create_assignment():
    
    
    Lab = ''
    Name = ''
    ClassID = ''
    SchoolYear = ''
    Publish = ''
    Due = ''
    AssignTo = ''
    Creator = ''
    MaxScore = []
    File = []
    
    
    ASN_data = (Lab, AssignTo, Publish, Due, ClassID, SchoolYear)
    
    
    try:
        # Establish MySQL connection
        conn = get_db()
        cursor = conn.cursor()
        
        # Loop นับจำนวน Question จาก score แล้ว Insert all
        for QSTNum, MS in enumerate(MaxScore):
            Question = QSTNum+1
            MScore = MS
            QST_data = (Creator, Lab, Question, Name, MScore, ClassID, SchoolYear)

            insert_question_query = "INSERT INTO question (Creator, LAB, Question, Name, MaxScore, ClassID, SchoolYear) VALUES (%s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(insert_question_query, QST_data)
        
        # File path แจก all
        for filepath in File:
            eachFile = filepath
            
            File_data = (Lab, eachFile, ClassID, SchoolYear)
            insert_file_query = "INSERT INTO file_paths (LAB, PathToFile, ClassID, SchoolYear) VALUES (%s, %s, %s, %s)"
            try:
                cursor.execute(insert_file_query, File_data)
            except mysql.connector.Error as error:
                print("Error inserting file path '{eachFile}': {error}")
        
        # Assignment Data Insert
        insert_assign_query = "INSERT INTO assign (LAB, AssignTo, PublishTime, DueTime, ClassID, SchoolYear) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(insert_assign_query, ASN_data)

        # Commit the transaction
        conn.commit()
        
        return jsonify({"message": "Data inserted successfully!"})

    except mysql.connector.Error as error:
        # Rollback transaction in case of an error
        conn.rollback()
        return jsonify({"error": f"An error occurred while inserting data: {error}"}), 500

    finally:
        # Close the cursor and MySQL connection
        if 'cursor' in locals() and cursor:
            cursor.close()

@app.route("/PostTester", methods=["POST"])
def PostTester():
    
    # Get form data
    data = request.get_json()
    class_name = data.get('ClassName')
    class_id = data.get('ClassID')
    school_year = data.get('SchoolYear')
    print('name:',class_name)
    print('id:',class_id)
    print('schoolyear:',school_year)
    # Perform any processing with the form data
    # For example, you can save it to a database or perform validations

    # Construct a response
    response = {
        "message": "Data received successfully",
        "Status": True,
        "ClassName": class_name,
        "ClassID": class_id,
        "SchoolYear": school_year
    }
    return jsonify(response)




if __name__ == '__main__':
    app.run(debug=True)

