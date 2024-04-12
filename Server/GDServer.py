from flask import Flask, jsonify, request, g, Response
from flask_cors import CORS
import pymysql
from werkzeug.utils import secure_filename
import os
import mysql.connector
import csv
from datetime import datetime
import pytz
import json
from io import StringIO

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

""" def get_db():
    if 'db' not in g:
        g.db = pymysql.connect(
            host='54.251.143.51',
            user='root',
            password='5T7H2t6J7PjIDEUMLNrc',
            database='grader2',
        )
    return g.db """

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
def isCSV(filename): 
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'csv'

def isIPYNB(filename): 
    return '.' in filename and filename.rsplit('.', 1)[1].lower() == 'ipynb'

#*******picture check and delete old picture ด้วย
def isPicture(filename): 
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'png', 'jpg', 'jpeg', 'gif'}

def GetClassSchoolyear(dbCLS,cursor,CSYID):
    try:
        query = """SELECT ClassID,SchoolYear FROM class CLS WHERE CSYID=%s"""
        cursor.execute(query,(CSYID))
        # Fetch all rows
        data = cursor.fetchall()[0]
        return data
    except Exception as e:
        dbCLS.rollback()
        return False

def GetCSYID(dbCLS,cursor,ClassID,SchoolYear):
    try:
        query = """SELECT CSYID FROM class CLS WHERE CLS.ClassID = %s AND CLS.SchoolYear = %s"""
        cursor.execute(query,(ClassID,SchoolYear))
        # Fetch all rows
        data = cursor.fetchone()
        return data[0]
    except Exception as e:
        dbCLS.rollback()
        return False
    
def GetCID(dbSec,cursor,section,CSYID):
    try:
        query = """SELECT CID FROM section SCT WHERE SCT.Section = %s AND SCT.CSYID = %s """
        cursor.execute(query,(section,CSYID))
        # Fetch all rows
        dbSec = cursor.fetchone()
        return dbSec[0]
    except Exception as e:
        dbSec.rollback()
        return False
    
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
    
### Add a Student in grader
def AddUserGrader(dbAUG, cursor, UID, Email, Name):
    try:
        insert_user = "INSERT INTO user (Email, UID, Name) VALUES (%s, %s, %s)"
        cursor.execute(insert_user, (UID, Email, Name))
        dbAUG.commit()
        return True
    except Exception as e:
        dbAUG.rollback()
        return False

### Create Section in Class
def CreateSection(dbCST, cursor, CSYID, Section):
    try:
        insert_section = "INSERT INTO section (CSYID, Section) VALUES (%s, %s)"
        cursor.execute(insert_section, (CSYID, Section))
        return True
    except Exception as e:
        dbCST.rollback()
        return False
    
### Add a User in class
def AddUserClass(dbAUC, cursor, UID, CSYID, Section):
    try:
        #adduser
        query_insertUSC = """INSERT INTO student (CID, UID) VALUES (%s, %s)"""
        cursor.execute(query_insertUSC, ( GetCID(dbAUC, cursor,Section,CSYID), UID))
        dbAUC.commit()    
        return True
    except Exception as e:
        dbAUC.rollback()
        print("An error occurred:", e)   
        return False   
    
@app.route("/section", methods=["GET"])
def get_section():
    
    conn = get_db()
    cursor = conn.cursor()
    
    CSYID = request.args.get("CSYID")
    section_query = """SELECT SCT.Section FROM section SCT WHERE SCT.CSYID = %s"""
    cursor.execute(section_query, (CSYID,))
    data = cursor.fetchall()
    
    # Transform the fetched data into a list of section values
    transformdata = [row[0] for row in data]
    
    return jsonify(transformdata)

@app.route("/TA/class/Assign/data", methods=["GET"])
def get_assigndata():
    conn = get_db()
    cursor = conn.cursor()
    
    LabNumber = request.args.get("labnumber")
    CSYID = request.args.get("CSYID")
    
    transformdata = {}
    
    # Query for question datetime
    question_datetime_query = """
    SELECT
        SCT.Section,
        ASN.Publish,
        ASN.Due
    FROM
        section SCT
        INNER JOIN assign ASN ON SCT.CID = ASN.CID
    WHERE 
        SCT.CSYID = %s
        AND ASN.Lab = %s
    """
    cursor.execute(question_datetime_query, (CSYID, LabNumber))
    datetime_data = cursor.fetchall()
    
    transformdata['LabTime'] = {}
    for row in datetime_data:
        section = row[0]
        publish = row[1]
        due = row[2]
        formatted_publish = publish.strftime("%Y-%m-%dT%H:%M")
        formatted_due = due.strftime("%Y-%m-%dT%H:%M")

        transformdata['LabTime'][section] = {'publishDate': formatted_publish, 'dueDate': formatted_due}
    
    # Query for question and max score
    question_questionsscore_query = """
    SELECT
        QST.Question,
        QST.MaxScore
    FROM
        question QST
    WHERE 
        QST.CSYID = %s
        AND QST.Lab = %s
    """
    cursor.execute(question_questionsscore_query, (CSYID, LabNumber))
    question_data = cursor.fetchall()
    
    transformdata['Question'] = [{"id": q[0], "score": q[1]} for q in question_data]
    
    # Query for additional files
    question_addfile_query = """
    SELECT
        ADF.PathToFile
    FROM
        addfile ADF
    WHERE
        ADF.CSYID = %s
        AND ADF.Lab = %s
    """
    cursor.execute(question_addfile_query, (CSYID, LabNumber))
    file_data = cursor.fetchall()
    
    transformdata['file'] = [f[0] for f in file_data]
    
    # Query for Section
    question_section_query = """
    SELECT
        Section
    FROM
        assign ASN
        INNER JOIN section SCT ON SCT.CID = ASN.CID
    WHERE
        ASN.CSYID = %s
        AND ASN.Lab = %s
    """
    cursor.execute(question_section_query, (CSYID, LabNumber))
    section = cursor.fetchall()

    transformdata['section'] = [f[0] for f in section]
    
    return jsonify(transformdata)

    
@app.route("/upload/CSV", methods=["POST"])
def addstudentclass():
    
    CSYID = request.form.get("CSYID") 
    uploaded_CSV = request.files["file"]
    filename = secure_filename(uploaded_CSV.filename)
    filename = f"{CSYID}{os.path.splitext(uploaded_CSV.filename)[1]}"
    filepath = os.path.join(UPLOAD_FOLDER,'CSV',filename)
    
    if not isCSV(uploaded_CSV.filename):
        return jsonify({"message": "upload file must be .CSV"}), 500 

    try:
        uploaded_CSV.save(filepath)
        try:
            conn = get_db()
            cursor = conn.cursor()
            
            #clear student in class
            delete_student_class = """DELETE STD FROM student STD INNER JOIN section SCT ON STD.CID = SCT.CID WHERE SCT.CSYID = %s"""
            cursor.execute(delete_student_class, (CSYID,))

            
            #read file and add user
            with open(filepath, newline='') as csvfile:
                reader = csv.reader(csvfile)
                next(reader, None)
                maxSection = 1
                for row in reader:
                    print(row)
                    UID, Name, Section = row
                    Email = UID + "@student.chula.ac.th"
                    AddUserGrader(conn, cursor, Email, UID, Name)
                    CreateSection(conn, cursor, CSYID, Section)
                    AddUserClass(conn, cursor, UID, CSYID, Section)
                    if(maxSection < Section):maxSection=Section
                #clear unused section
                delete_student_class = """DELETE SCT FROM section SCT WHERE SCT.CSYID = %s AND SCT.Section > %s"""
                cursor.execute(delete_student_class, (CSYID,maxSection))
            
            conn.commit()
            return jsonify({"message": "File uploaded successfully!"})
        except FileNotFoundError:
            print(f"File {filepath} not found.")
            return jsonify({"message": "An error occurred while updating the file."}), 500
        except Exception as e:
            print("An error occurred:", e)
            return jsonify({"message": "An error occurred while updating the file."}), 500
        
    except Exception as e:
        print("Error saving file: {e}")
        return jsonify({"message": "An error occurred while uploading the file."}), 500
 
###Upload Thumbnail
@app.route("/upload/Thumbnail", methods=["POST"])
def upload_Thumbnail(uploaded_thumbnail,CSYID):

    CSYID = request.form.get("CSYID") 
    uploaded_thumbnail = request.files["file"]
    
    if uploaded_thumbnail and uploaded_thumbnail.filename != "":
        filename = secure_filename(uploaded_thumbnail.filename)
        filename = f"{CSYID}{os.path.splitext(uploaded_thumbnail.filename)[1]}"
        filepath = os.path.join(UPLOAD_FOLDER,'Thumbnail',filename)        
        try:
            uploaded_thumbnail.save(filepath)
            return True
        except Exception as e:
            print("Error saving file: {e}")
            return False
    return False

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
def Editor_section():
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
                MaxScores.MaxScore AS Lab_MaxScore,
                Scores.Score AS Lab_Score,
                CASE WHEN SMT.Timestamp IS NOT NULL THEN TRUE ELSE FALSE END AS TurnIn,
                CASE WHEN ASN.Due <= SMT.Timestamp THEN TRUE ELSE FALSE END AS Late
            FROM
                question QST
                INNER JOIN lab LB ON QST.CSYID = LB.CSYID AND QST.Lab = LB.lab
                INNER JOIN section SCT ON SCT.CSYID = QST.CSYID
                INNER JOIN assign ASN ON SCT.CID = ASN.CID AND QST.Lab = ASN.Lab
                INNER JOIN student STD ON STD.UID = %s AND STD.CID = ASN.CID
                LEFT JOIN submitted SMT ON QST.CSYID = SMT.CSYID AND QST.Lab = SMT.Lab AND QST.Question = SMT.Question AND SMT.UID = STD.UID
                LEFT JOIN (
                    SELECT Lab, SUM(MaxScore) AS MaxScore
                    FROM question
                    WHERE CSYID = %s
                    GROUP BY Lab
                ) AS MaxScores ON QST.Lab = MaxScores.Lab 
                LEFT JOIN (
                    SELECT Lab, SUM(Score) AS Score
                    FROM submitted
                    WHERE CSYID = %s
                    GROUP BY Lab
                ) AS Scores ON QST.Lab = Scores.Lab
            WHERE
                QST.CSYID = %s;

                 """

        # Execute a SELECT statement
        cur.execute(query, (student_id,class_id,class_id,class_id))
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
                    'Maxscore' :int(Maxscore) if Maxscore else 0,
                    'Score' : int(score) if score else 0
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
                SMT.TurnInFile,
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
            lab, lab_name, question_id, question, due_time, submission_time, score, max_score, turn_in_file, Late = row
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
                    'MaxScore': max_score,
                    'Late': bool(Late)
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
    
    CSYID = request.form.get('CSYID')
    
    try:
        conn = get_db()
        cursor = conn.cursor()
        insert_class_query = "DELETE FROM class WHERE CSYID = %s;"
        cursor.execute(insert_class_query, (CSYID))
        conn.commit()
        return jsonify({"Status": True}) 
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"message":"An error occurred while delete class.","Status": False})                       

@app.route("/TA/class/edit", methods=["POST"])
def edit_class():
    
    conn = get_db()
    cursor = conn.cursor()
    
    Section = request.form.get('Section')
    
    ClassName = request.form.get('ClassName')
    ClassID = request.form.get('ClassID')
    SchoolYear = request.form.get('SchoolYear')
    CSYID = request.form.get('CSYID')
    
    print('Data:',ClassName, ClassID, SchoolYear, CSYID)
    """ csvfile = request.files.get['file1']
    thumbnailfile = request.files.get['file2'] """
    """ Thumbnail = %s thumbnailfile.filename"""
    try:
        update_class = """ 
            UPDATE class
            SET ClassName = %s,
                ClassID = %s,
                SchoolYear = %s
            WHERE CSYID = %s
            """
        cursor.execute(update_class, (ClassName, ClassID, SchoolYear, CSYID))
        conn.commit()
        return jsonify({"message":"class update successfully","Status": True})
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"message":"An error occurred while delete class.","Status": False})   

@app.route("/TA/class/Assign", methods=["GET"])
def TAclass_assignment():
    try:
        cursor = g.db.cursor()
        CSYID = request.args.get('CSYID')

        query = """ 
            SELECT
                LB.Lab,
                LB.Name,
                SCT.Section,
                ASN.Publish,
                ASN.Due,
                LB.CSYID
            FROM
                Lab LB 
                INNER JOIN assign ASN ON LB.CSYID = ASN.CSYID AND LB.Lab = ASN.Lab 
                INNER JOIN section SCT ON SCT.CSYID = LB.CSYID AND SCT.CID = ASN.CID
            WHERE 
                LB.CSYID = %s
            ORDER BY
	            Publish ASC,Lab DESC;
            """
        cursor.execute(query, (CSYID))

        data = cursor.fetchall()

        assignments = {}

        for row in data:
            lab_number = row[0]  # Accessing the first element in the tuple
            lab_name = row[1]    # Accessing the second element in the tuple
            section_number = row[2]  # Accessing the third element in the tuple
            
            # Convert 'Publish' and 'Due' strings to datetime objects
            publish_date = row[3]
            due_date = row[4]

            # Create the structure if lab_number is not already a key in the assignments dictionary
            if lab_number not in assignments:
                assignments[lab_number] = {
                    'LabName': lab_name,
                    'Section': {}
                }

            # Add section information under the lab
            assignments[lab_number]['Section'][section_number] = {
                'Publish': publish_date,
                'Due': due_date
            }

        # Wrap the assignments dictionary into a 'Assignment' key as you specified
        result = {'Assignment': assignments}

        # Return the result as JSON
        return jsonify(result)
        
    except mysql.connector.Error as error:
        return jsonify({"error": f"An error occurred: {error}"}), 500

@app.route("/TA/class/Assign/Create", methods=["POST"])
def TAclass_assignmentcreate():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        Creator = request.form.get('Creator')
        LabNum = request.form.get('labNum')
        LabName = request.form.get('labName')
        CSYID = request.form.get('CSYID')
        Question = json.loads(request.form.get('Question'))
        submittedDates = json.loads(request.form.get('submittedDates'))
        Create_time = datetime.now(gmt_timezone)
        
        #check if lab already exist
        select_lab_query = "SELECT Lab,Name,CSYID FROM lab WHERE Lab = %s AND CSYID = %s"
        cursor.execute(select_lab_query, (LabNum, CSYID))
        exist_lab = cursor.fetchone()

        if exist_lab:
            return jsonify({"message": "Lab already exists. Please select a different Lab number.","Status":1}), 500
        else:
            #create Lab first
            insert_lab_query = "INSERT INTO lab (Lab, Name, CSYID) VALUES (%s, %s, %s)"
            cursor.execute(insert_lab_query, (LabNum, LabName, CSYID))

            #create Question
            for question_data in Question:
                try:
                    question_id = question_data['id']
                    score = question_data['score']
                    # Insert question data into the database
                    insert_question_query = "INSERT INTO question (Creator, Lab, Question, MaxScore, LastEdit, CSYID) VALUES (%s, %s, %s, %s, %s, %s)"
                    cursor.execute(insert_question_query, (Creator, LabNum, question_id, score, Create_time, CSYID))
                except mysql.connector.Error as error:
                    conn.rollback()
                    return jsonify({"error": f"An error occurred: {error}","Status":False}), 500

            #assign to section
            for section, dates in submittedDates.items():
                Publish = dates['publishDate']
                Due = dates['dueDate']
                CID = GetCID(conn,cursor,section,CSYID)
                insert_assignTo = """ INSERT INTO assign (Lab,Publish,Due,CID,CSYID) VALUES(%s,%s,%s,%s,%s) """
                cursor.execute(insert_assignTo,(LabNum,Publish,Due,CID,CSYID))

            conn.commit()
            return jsonify({"message":"create success","Status":True}), 500
        
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {error}","Status":False}), 500

@app.route("/TA/class/Assign/delete", methods=["POST"])
def TAclass_assignmentdelete():
    try:
        conn = get_db()
        cursor = conn.cursor()

        LabNum = request.form.get('oldlabNum')
        CSYID = request.form.get('CSYID')

        #just delete lab
        
        delete_lab_query = "DELETE LB FROM lab LB WHERE LB.Lab = %s AND LB.CSYID = %s"
        cursor.execute(delete_lab_query, (LabNum, CSYID))        
        conn.commit()
        return jsonify({"message":"delete success","Status":True}), 500
        
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {error}","Status":False}), 500
                
@app.route("/TA/class/Assign/Edit", methods=["POST"])
def TAclass_assignmentedit():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        Creator = request.form.get('Creator') #no change
        CSYID = request.form.get('CSYID') #no change
        Create_time = datetime.now(gmt_timezone) #no change
        
        oldLabNum = request.form.get('oldlabNum')
        oldQuestion = json.loads(request.form.get('oldQuestion'))
        oldsubmittedDates = json.loads(request.form.get('oldsubmittedDates'))
        
        
        LabNum = request.form.get('labNum')
        LabName = request.form.get('labName')
        Question = json.loads(request.form.get('Question'))
        submittedDates = json.loads(request.form.get('submittedDates'))
        
        

        #check lab exist
        select_lab_query = "SELECT Lab,Name,CSYID FROM lab WHERE Lab = %s AND CSYID = %s"
        cursor.execute(select_lab_query, (LabNum, CSYID))
        exist_lab = cursor.fetchone()

        if exist_lab:
            return jsonify({"message": "Lab already exists. Please select a different Lab number.","Status":1}), 500
        else:
            
            #update lab
            update_lab_query = """ UPDATE lab SET Lab = %s,Name = %s WHERE Lab = %s AND CSYID = %s """
            
            cursor.execute(update_lab_query, (LabNum, LabName, oldLabNum, CSYID))

            
            #update Question
            try:
                for question_data in Question:
                    question_id = question_data['id']
                    score = question_data['score']
                    # Insert question data into the database
                    insert_question_query = """ 
                        INSERT INTO question (Creator, Lab, Question, MaxScore, LastEdit, CSYID)
                        VALUES (%s, %s, %s, %s, %s, %s) AS new
                        ON DUPLICATE KEY UPDATE MaxScore = new.MaxScore,LastEdit = new.LastEdit
                    """
                    cursor.execute(insert_question_query, (Creator, LabNum, question_id, score, Create_time, CSYID))
                    maxQuestion = question_id
            
            except mysql.connector.Error as error:
                conn.rollback()
                return jsonify({"error": f"An error occurred: {error}","Status":False}), 500

            #delete unuse Question
            try:
                delete_question_query = """ 
                        DELETE QST FROM question QST WHERE QST.Lab = %s AND QST.CSYID = %s AND QST.Question > %s
                    """
                cursor.execute(delete_question_query, (LabNum, CSYID, maxQuestion))
                    
            except mysql.connector.Error as error:
                    conn.rollback()
                    return jsonify({"error": f"An error occurred: {error}","Status":False}), 500

            #delete old assign
            try:
                delete_assign_query = """ 
                        DELETE ASN FROM assign ASN WHERE ASN.Lab = %s AND ASN.CSYID = %s
                    """
                cursor.execute(delete_assign_query, (LabNum, CSYID))
                
            except mysql.connector.Error as error:
                conn.rollback()
                return jsonify({"error": f"An error occurred: {error}","Status":False}), 500
            
            #assign to section
            try:
                for section, dates in submittedDates.items():
                    Publish = dates['publishDate']
                    Due = dates['dueDate']
                    CID = GetCID(conn,cursor,section,CSYID)
                    insert_assignTo = """ INSERT INTO assign (Lab,Publish,Due,CID,CSYID) VALUES(%s,%s,%s,%s,%s) """
                    cursor.execute(insert_assignTo,(LabNum,Publish,Due,CID,CSYID))
            except mysql.connector.Error as error:
                conn.rollback()
                return jsonify({"error": f"An error occurred: {error}","Status":False}), 500

            conn.commit()
            return jsonify({"message":"create success","Status":True}), 500
        
    except mysql.connector.Error as error:
        conn.rollback()
        return jsonify({"error": f"An error occurred: {error}","Status":False}), 500
    
@app.route("/TA/class/score", methods=["GET"])
def TAclass_score():
    try:
        
        cursor = g.db.cursor()
        
        CSYID = request.args.get('CSYID')
        Section = request.args.get('Section')
        Lab = request.args.get('Lab')
                
        query = """ 
            SELECT 
                STD.UID,
                USR.Name,
                QST.Lab,
                QST.Question,
                LB.Name as LabName,
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
                INNER JOIN assign ASN ON SCT.CID = ASN.CID AND QST.Lab = ASN.Lab AND ASN.Lab = LB.Lab AND ASN.CSYID = LB.CSYID
                INNER JOIN student STD ON STD.CID = ASN.CID
                LEFT JOIN submitted SMT ON QST.CSYID = SMT.CSYID AND QST.Lab = SMT.Lab AND QST.Question = SMT.Question AND SMT.UID = STD.UID
                INNER JOIN user USR ON USR.UID = STD.UID
            WHERE
                QST.CSYID = %s
                AND SCT.Section = %s
                AND LB.Lab = %s
            """ 
        cursor.execute(query, (CSYID , Section, Lab))
        
        data = cursor.fetchall()
        transformed_data = {}

        for entry in data:
            uid, name, lab, question, lab_name, due, timestamp, max_score, score, turn_in, late = entry
            if lab not in transformed_data:
                transformed_data[lab] = {'LabName': lab_name, 'Due': due, 'Questions': {}}
            if question not in transformed_data[lab]['Questions']:
                transformed_data[lab]['Questions'][question] = {'MaxScore': max_score, 'Scores': {}}
            transformed_data[lab]['Questions'][question]['Scores'][uid] = {'Name':name,'Score': score, 'Timestamp': timestamp,'Late':bool(late)}


        return jsonify(transformed_data[Lab])
        
    except mysql.connector.Error as error:
        return jsonify({"error": f"An error occurred: {error}"}), 500
    
@app.route("/TA/Student/List", methods=["GET"])
def StudentList():
    
    CSYID = request.args.get('CSYID')
    cur = g.db.cursor()
    TotalScore_query = """ 
    SELECT
        BIG.UID,
        BIG.Name,
        BIG.Section,
        SUM(Big.Score) AS TotalScore
    FROM
    (
    SELECT 
        STD.UID,
        USR.Name,
        SCT.Section,
        QST.Lab,
        QST.Question,
        LB.Name as LabName,
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
        INNER JOIN assign ASN ON SCT.CID = ASN.CID AND QST.Lab = ASN.Lab AND ASN.Lab = LB.Lab AND ASN.CSYID = LB.CSYID
        INNER JOIN student STD ON STD.CID = ASN.CID
        LEFT JOIN submitted SMT ON QST.CSYID = SMT.CSYID AND QST.Lab = SMT.Lab AND QST.Question = SMT.Question AND SMT.UID = STD.UID
        INNER JOIN user USR ON USR.UID = STD.UID
    WHERE
        QST.CSYID = %s
    ) as BIG
    GROUP BY
        BIG.UID, BIG.Section
    """
    cur.execute(TotalScore_query,(CSYID))
    TotalResult = cur.fetchall()
    
    transformed_data = []

    for row in TotalResult:
        UID , Name, Section, TotalScore= row
        transformed_data.append({'UID': UID, 'Name': Name, 'Section': Section, 'Score': TotalScore})
        
    MaxScore_query = """ 
        SELECT
            SUM(QST.MaxScore) as TotalMax 
        FROM
            Question QST
        WHERE
            QST.CSYID = %s
        GROUP BY
            QST.CSYID
    """
    cur.execute(MaxScore_query,(CSYID))
    TotalMax = cur.fetchone()[0]
    
    Full_transformed_data = {'TotalMax': TotalMax, 'transformed_data': transformed_data}

    
    return jsonify(Full_transformed_data)

@app.route("/TA/Student/List/CSV", methods=["POST"])
def CSVList():   
    conn = get_db()
    cursor = conn.cursor()
    
    # Parse JSON data from the request
    data = json.loads(request.form.get('CSV_data'))
    CSV_data = data["CSV_data"]
    MaxTotal = data["MaxTotal"]
    CSYID = data["CSYID"]

    print(CSV_data)
    print(MaxTotal)
    print(CSYID)
    
    ClassID, SchoolYear = GetClassSchoolyear(conn, cursor, CSYID) 
    
    # Specify the initial fieldnames
    fieldnames = ['UID', 'Name', 'Section', 'Score']

    print('Fieldnames:', fieldnames)
    print('First row keys:', CSV_data[0].keys())

    # Create a temporary in-memory buffer to store the CSV data
    temp_output = StringIO()
    
    # Create a DictWriter object and write the CSV data to the temporary buffer
    writer = csv.DictWriter(temp_output, fieldnames=fieldnames)
    writer.writeheader()
    for row in CSV_data:
        writer.writerow(row)

    # Read the CSV data from the temporary buffer
    temp_output.seek(0)
    temp_csv_data = temp_output.getvalue()
    temp_output.close()

    # Modify the header names in the CSV data
    modified_csv_data = temp_csv_data.replace('Score', f'Score ({MaxTotal})')

    # Create an in-memory binary stream for the final output
    output = StringIO(modified_csv_data)

    # Set response headers to indicate CSV content
    headers = {
        "Content-Disposition": f"attachment; filename={ClassID}-{SchoolYear}.csv",
        "Content-Type": "text/csv"
    }

    # Return the content of the final output stream as a Flask response
    return Response(output.getvalue(), headers=headers)




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


if __name__ == '__main__':
    app.run(debug=True)

