from flask import Flask, jsonify, request, g
from flask_cors import CORS
import pymysql
from werkzeug.utils import secure_filename
import os
import mysql.connector
import csv
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app, supports_credentials=True, origins='*')


def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(
            host='127.0.0.1',
            user='root',
            password='Taotong',
            database='grader2',
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

gmt_timezone = pytz.timezone('GMT')

########UPLOAD_FOLDER
UPLOAD_FOLDER = 'C:/Users/B/Desktop/Project CU/UploadFile'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
""" Global API + Function """
###Is CSV
def isCSV(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

def isIPYNB(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'ipynb'

#### Add CET
def AddClassEditor(dbACE,cursor,Email,CSYID):
    try:
        insert_user = "INSERT INTO classeditor (Email, CSYID) VALUES (%s, %s)"
        cursor.execute(insert_user, (Email, CSYID))
        dbACE.commit()
        return True
    except Exception as e:
        dbACE.rollback()
        return False

def GetCSYID(dbCLS,cursor,ClassID,SchoolYear):
    try:
        query = """SELECT CSYID FROM class CLS WHERE CLS.ClassID = %s AND CLS.SchoolYear = %s"""
        cursor.execute(query,(ClassID,SchoolYear))
        # Fetch all rows
        dbCLS = cursor.fetchone()
        return dbCLS[0]
    except Exception as e:
        dbCLS.rollback()
        return False
        
### Add a Student in grader
def AddUserGrader(dbAUG, cursor, SID, Email, Name):
    try:
        insert_user = "INSERT INTO user (EmailName, Email, Name) VALUES (%s, %s, %s)"
        cursor.execute(insert_user, (SID, Email, Name))
        dbAUG.commit()
        return True
    except Exception as e:
        dbAUG.rollback()
        return False
    
### Add a User in class
def AddUserClass(dbAUC, cursor, UserEmail, ClassID, SchoolYear, Section):
    try:
        query_getclass = """
            SELECT DISTINCT ID
            FROM Class
            WHERE ClassID = %s AND Section = %s AND SchoolYear = %s
        """
        cursor.execute(query_getclass, (ClassID, Section, SchoolYear))
        id_class = cursor.fetchone()
        
        if id_class:
            query_insertUSC = """
                INSERT INTO userclass (Email, IDClass) VALUES (%s, %s)
            """
            cursor.execute(query_insertUSC, (UserEmail, id_class[0]))
            dbAUC.commit()    
            return True
        else:
            dbAUC.rollback()
            return False


    except Exception as e:
        dbAUC.rollback()
        print("An error occurred:", e)
        
###Delete user in Class
def DeleteUserClass(conn,cursor,Email,class_id,school_year):
    try:
        delete_query = """
            DELETE SMT
            FROM submitted SMT
            INNER JOIN userclass USC on SMT.StudentID = LEFT(USC.Email, LOCATE('@', USC.Email) - 1)
            WHERE SMT.StudentID = %s
                AND SMT.ClassID = %s
                AND SMT.SchoolYear = %s
        """
        cursor.execute(delete_query, (Email, class_id, school_year))
        conn.commit()
        return jsonify({"message": "Rows deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500  

### Delete User Summit
def DeleteUserSummit(conn,cursor):
    try:
        conn = get_db()
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500  
        

###Upload CSV
@app.route("/upload/CSV", methods=["POST"])
def upload_CSV():
    
    ClassID = request.form.get("ClassID")
    SchoolYear = request.form.get("SchoolYear")
    SYFile = SchoolYear.replace("/", "T")
    uploaded_file = request.files["file"]

    if uploaded_file.filename != "":
        filename = secure_filename(uploaded_file.filename)
                    
        filename = f"{ClassID}-{SYFile}{os.path.splitext(uploaded_file.filename)[1]}"
        filepath = os.path.join(UPLOAD_FOLDER,'CSV',filename)
        
        try:
            # Save the file
            uploaded_file.save(filepath)
            # Return a success message
            UpdateStudentCSV(ClassID, SchoolYear)
            return jsonify({"Status": True})

        except Exception as e:
            # Handle any exceptions during file saving gracefully
            print("Error saving file: {e}")
            return jsonify({"Status": False}), 500
    return jsonify({'Status': False}), 400

### Read & Update CSV
@app.route('/update/CSV', methods=['POST'])
def UpdateStudentCSV(ClassID, SchoolYear):
    ClassID = request.form.get('ClassID')
    SchoolYear = request.form.get('SchoolYear')
    
    SYFile = SchoolYear.replace("/", "T")
    filename = ClassID + "-" + SYFile + ".csv"
    
    file_path = os.path.join(UPLOAD_FOLDER,'CSV',filename)
    try:
        dbAUG = get_db()
        cursor = dbAUG.cursor()    
        with open(file_path, newline='') as csvfile:
            reader = csv.reader(csvfile)
            # Skip the header row if it exists
            next(reader, None)
            for row in reader:
                print(row)
                SID, Name, Section = row
                Email = SID + "@student.chula.ac.th"
                AddUserGrader(dbAUG, cursor, SID, Email, Name)
                AddUserClass(dbAUG, cursor, Email, ClassID, SchoolYear, Section)
    except FileNotFoundError:
        print(f"File {file_path} not found.")
    except Exception as e:
        print("An error occurred:", e)
 
### get classes by Email       
@app.route('/ST/class/classes', methods=['GET'])
def get_classesdata():
    try:
        #Param
        UID = request.args.get('UID')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
                SCT.CID,
                CLS.ClassName,
                CLS.ClassID,
                SCT.Section,
                CLS.SchoolYear,
                CLS.Thumbnail,
                CLS.ClassCreator,
                1 as ClassRole,
                CLS.CSYID
            FROM
                class CLS
                INNER JOIN section SCT ON SCT.CSYID = CLS.CSYID
                INNER JOIN student STD ON STD.CID = SCT.CID
                INNER JOIN user USR ON USR.UID = STD.UID
                LEFT JOIN classeditor CET ON CET.CSYID = CLS.CSYID AND CET.Email = USR.Email
            WHERE 
                USR.UID = %s
                AND Section <> 0
            ORDER BY
                SchoolYear DESC,ClassName ASC;
        """

        # Execute a SELECT statement
        cur.execute(query,(UID))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        ### sort by schoolyear
        transformed_data = {}
        for row in data:
            cid, name, class_id, section, school_year, thumbnail, classcreator, classrole, csyid = row
            class_info = {
                "ClassID": class_id,
                "ClassName": name,
                "ID": csyid,
                "Section": section,
                "Thumbnail": thumbnail
            }
            if school_year not in transformed_data:
                transformed_data[school_year] = [class_info]
            else:
                transformed_data[school_year].append(class_info)

        return jsonify(transformed_data)

        """ transformed_data = []
        for row in data:
            cid, name, class_id, section, school_year, thumbnail, classcreator, classrole, csyid = row
            transformed_data.append({
                "ClassID": class_id,
                "ClassName": name,
                "ID": csyid,
                "SchoolYear": school_year,
                "Section": section,
                "Thumbnail": thumbnail
            }) """
            
        return jsonify(transformed_data)

        

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500
    
@app.route('/TA/class/classes', methods=['GET'])
def Editor_Class():
    try:
        
        #Param
        Email = request.args.get('Email')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
                CLS.CSYID,
                CLS.ClassName,
                CLS.ClassID,
                CLS.SchoolYear,
                CLS.Thumbnail
            FROM
                class CLS
                INNER JOIN classeditor CET ON CET.CSYID = CLS.CSYID 
            WHERE 
                CET.Email = %s
            ORDER BY
                SchoolYear DESC;
                 """

        # Execute a SELECT statement
        cur.execute(query, (Email))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = {}

        for row in data:
            csyid, classname, classid, schoolyear, thumbnail = row
            class_info = {
                'ID': csyid,
                'ClassName': classname,
                'ClassID': classid,
                'Thumbnail': thumbnail if thumbnail else None
            }
            if schoolyear not in transformed_data:
                transformed_data[schoolyear] = [class_info]
            else:
                transformed_data[schoolyear].append(class_info)
    
        return jsonify(transformed_data)

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/TA/class/classes/section', methods=['GET'])
def ASLCP():
    try:
        #Param
        UID = request.args.get('UID')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT DISTINCT
                SCT.CID,
                CLS.ClassName,
                CLS.ClassID,
                SCT.Section,
                CLS.SchoolYear,
                CLS.Thumbnail,
                CLS.ClassCreator,
                2 as ClassRole,
                CLS.CSYID
            FROM
                User USR
                INNER JOIN classeditor CET
                LEFT JOIN class CLS ON CET.CSYID = CLS.CSYID 
                INNER JOIN section SCT ON SCT.CSYID = CLS.CSYID
                LEFT JOIN student STD ON STD.CID = SCT.CID 
            WHERE
                USR.UID = %s
                AND USR.Email IN (CET.Email)
                AND Section <> 0
            ORDER BY
                SchoolYear DESC,ClassName ASC;
        """

        # Execute a SELECT statement
        cur.execute(query,(UID))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = []
        for row in data:
            cid, name, class_id, section, school_year, thumbnail, classcreator, classrole, csyid = row
            transformed_data.append({
                "ClassID": class_id,
                "ClassName": name,
                "ID": csyid,
                "SchoolYear": school_year,
                "Section": section,
                "Thumbnail": thumbnail
            })
            
        return jsonify(transformed_data)

    except Exception as e:
        print(e)
        return jsonify({'error': 'An error occurred'}), 500

###Upload turnin assignment
@app.route("/upload/SMT", methods=["POST"])
def TurnIn():
    
    UID = request.form.get("UID")
    CSYID = request.form.get("CSYID")
    Lab = request.form.get("Lab")
    Question = request.form.get("Question")    
    uploaded_file = request.files["file"]

    upload_time = datetime.now(gmt_timezone)
    
    if not isIPYNB(uploaded_file.filename):
        return jsonify({"message": "upload file must be .ipynb"}), 500 
    if uploaded_file.filename != "":
        filename = secure_filename(uploaded_file.filename)        
        filename = f"{UID}-L{Lab}Q{Question}-{CSYID}{os.path.splitext(uploaded_file.filename)[1]}"
        filepath = os.path.join(UPLOAD_FOLDER,'TurnIn',filename)

        try:
            uploaded_file.save(filepath)
            ###test score
            score=10
            
            try:
                conn = get_db()
                cursor = conn.cursor()

                Insert_TurnIn = """ INSERT INTO submitted (UID, Lab, Question, TurnInFile, score, Timestamp, CSYID)
                    VALUES (%s, %s, %s, %s, %s, %s, %s) AS new
                    ON DUPLICATE KEY UPDATE TurnInFile = new.TurnInFile,Timestamp = new.Timestamp,score = new.score; """
                cursor.execute(Insert_TurnIn,(UID,Lab,Question,uploaded_file.filename,score,upload_time,CSYID))
                conn.commit()
                
            except Exception as e:
                conn.rollback()
                print("Error update score: {e}")
                return jsonify({"message": "An error occurred while updating score."}), 500
            
            return jsonify({"message": "File uploaded successfully!","At":upload_time.strftime("%Y-%m-%d %H:%M:%S"),"FileName":uploaded_file.filename,"Score":score})

        except Exception as e:
            # Handle any exceptions during file saving gracefully
            print("Error saving file: {e}")
            return jsonify({"message": "An error occurred while uploading the file."}), 500
        

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
                USR.UID,
                USR.Email,
                USR.Name,
                USR.Role
            FROM
                user USR
            WHERE 
                Email= %s
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
                    'ID': Ename,
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
        student_id = request.args.get('SID')
        class_id = request.args.get('CID')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
                QST.Lab,
                QST.Question,
                LB.Name,
                ASN.Due,
                SMT.Timestamp,
                QST.MaxScore,
                SMT.Score,
                CASE WHEN SMT.Timestamp IS NOT NULL THEN TRUE ELSE FALSE END As TurnIn,
                CASE WHEN ASN.Due <= SMT.Timestamp THEN TRUE ELSE FALSE END AS Late
            FROM
                question QST
                INNER JOIN lab LB ON QST.CSYID = LB.CSYID AND QST.Lab = LB.lab
                INNER JOIN section SCT ON SCT.CSYID = QST.CSYID
                INNER JOIN assign ASN ON SCT.CID = ASN.CID AND QST.Lab = ASN.Lab
                INNER JOIN student STD ON STD.UID = %s AND STD.CID = ASN.CID
                LEFT JOIN submitted SMT ON QST.CSYID = SMT.CSYID AND QST.Lab = SMT.Lab AND QST.Question = SMT.Question AND SMT.UID = STD.UID
            WHERE
                QST.CSYID = %s
                 """

        # Execute a SELECT statement
        cur.execute(query, (student_id,class_id))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        transformed_data = {}
        for row in data:
            lab, question, name, due_time, timestamp, Maxscore, score, turn_in, late = row
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
        Uid = request.args.get('UID')
        Csyid = request.args.get('CSYID')
        Lab = request.args.get('speclab')

        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
                QST.Lab,
                LB.Name,
                QST.QID,
                QST.Question,
                ASN.Due,
                SMT.Timestamp,
                SMT.Score,
                QST.MaxScore,
                SMT.TurnInFile
            FROM
                question QST
                INNER JOIN lab LB ON QST.CSYID = LB.CSYID AND QST.Lab = LB.lab
                INNER JOIN section SCT ON SCT.CSYID = QST.CSYID
                INNER JOIN assign ASN ON SCT.CID = ASN.CID AND QST.Lab = ASN.Lab
                INNER JOIN student STD ON STD.UID = %s AND STD.CID = ASN.CID
                LEFT JOIN submitted SMT ON QST.CSYID = SMT.CSYID AND QST.Lab = SMT.Lab AND QST.Question = SMT.Question AND SMT.UID = STD.UID
            WHERE
                QST.CSYID = %s
                AND QST.Lab = %s
                    """

        # Execute a SELECT statement
        cur.execute(query,(Uid,Csyid,Lab))
        # Fetch all rows
        data = cur.fetchall()

        # Close the cursor
        

        # Convert the result to the desired structure
        transformed_data_list = []
        
        for row in data:
            lab, lab_name, question_id, question, due_time, submission_time, score, max_score, turn_in_file = row
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
                    'Files': [],
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

            # Fetch files for the current lab and add them to the lab's 'Files' list
            query_files = """
                SELECT
                    PathToFile
                FROM
                    addfile ADF
                WHERE
                    ADF.CSYID = %s
                    AND ADF.Lab = %s
            """
            cur.execute(query_files, (Csyid, lab))
            files_data = cur.fetchall()
            for file_row in files_data:
                file_path = file_row[0]
                if file_path not in lab_data['Files']:
                    lab_data['Files'].append(file_path)

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
    CLS_data = (ClassName, ClassID, SchoolYear, Creator)

    
    try:
        # Establish MySQL connection
        conn = get_db()
        cursor = conn.cursor()
            
        # Insert data into the class table
        insert_class_query = "INSERT INTO class (ClassName, ClassID, SchoolYear, ClassCreator) VALUES (%s, %s, %s, %s)"
        cursor.execute(insert_class_query, CLS_data)
        conn.commit()
        
        if AddClassEditor(conn,cursor,Creator,GetCSYID(conn,cursor,ClassID,SchoolYear)):
            return jsonify({"Status": True})
        else:
            return jsonify({"Status": False})
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"Status": False})
            
@app.route("/TA/class/delete", methods=["POST"])
def delete_class():
    
    CSYID = request.args.get('CSYID')
    ClassName = request.args.get('ClassName')
    ClassID = request.args.get('ClassID')
    SchoolYear = request.args.get('SchoolYear')
    
    CLS_data = (ClassName, ClassID, SchoolYear)

    
    try:
        conn = get_db()
        cursor = conn.cursor()
            
        insert_class_query = "DELETE FROM class WHERE CSYID = %s;"
        cursor.execute(insert_class_query, (CSYID))
        
        # Commit the transaction
        conn.commit()
        return jsonify({"Status": True}) 
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"message":"An error occurred while delete class.","Status": False})                       

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

@app.route("/TA/Student/LabList", methods=["GET"])
def LabStudentList():
    #ลืม section
        #Param
        class_id = request.args.get('class_id')
        school_year = request.args.get('school_year')
        
        # Create a cursor
        cur = g.db.cursor()

        query = """
            SELECT
            	QST.LAB,
                QST.Question,
                USR.EmailName,
                CLS.Section,
                USR.Name,
                SMT.TimeStamp,
                SMT.Score,
                QST.MaxScore,
                ASN.DueTime,
                CASE WHEN SMT.TimeStamp IS NOT NULL THEN TRUE ELSE FALSE END As TurnIn,
                CASE WHEN ASN.DueTime <= SMT.TimeStamp THEN TRUE ELSE FALSE END AS Late
            FROM
            	Question QST
                INNER JOIN class CLS 
                INNER JOIN userclass USC ON CLS.ID = USC.IDClass 
                INNER JOIN submitted SMT ON QST.LAB = SMT.LAB AND QST.Question = SMT.Question
                INNER JOIN assign ASN ON QST.LAB = ASN.LAB
                INNER JOIN user USR ON USC.Email = USR.Email
            WHERE
                QST.ClassID = %s
                AND QST.SchoolYear = %s
                AND QST.ClassID = ASN.ClassID AND ASN.ClassID = SMT.ClassID AND SMT.ClassID = CLS.ClassID
            	AND QST.SchoolYear = ASN.SchoolYear AND ASN.SchoolYear = SMT.SchoolYear AND SMT.SchoolYear = CLS.SchoolYear
                AND LEFT(USC.Email, LOCATE('@', USC.Email) - 1) = SMT.StudentID
            ORDER BY
            	USR.EmailName ASC,QST.LAB ASC, QST.Question ASC;
                    """

        # Execute a SELECT statement
        cur.execute(query,(class_id,school_year))
        # Fetch all rows
        data = cur.fetchall()

        transformed_data = {}

        for row in data:
            lab, question, emailname, section, name, timestamp, score, maxscore, duetime, turn_in, late = row

            # Convert turn_in and late to boolean values
            turn_in_bool = bool(turn_in)
            late_bool = bool(late)

            # Create LAB if it doesn't exist
            if emailname not in transformed_data:
                transformed_data[emailname] = {"EmailName": emailname, "Name": name, "Section":section}

            # Create LAB dictionary if it doesn't exist
            if f'LAB{lab}' not in transformed_data[emailname]:
                transformed_data[emailname][f'LAB{lab}'] = {}

            # Add question data to LAB dictionary
            transformed_data[emailname][f'LAB{lab}'][f'Q{question}'] = {
                'DueTime': duetime,
                'Score': score,
                'Maxscore': maxscore,
                'TimeStamp': timestamp,
                'Late': late_bool,
                'TurnIn': turn_in_bool
            }

        # Convert the dictionary to a list of values
        transformed_data_list = list(transformed_data.values())
            
        # Close the cursor
        cur.close()

        # Convert the result to the desired structure
        return jsonify(transformed_data_list)

        
    
    
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

