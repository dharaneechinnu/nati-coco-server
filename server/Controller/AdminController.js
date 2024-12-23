const Admin = require('../Model/AdminModel');
const User = require('../Model/User'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const PASS = process.env.PASS;
const nodemailer = require('nodemailer');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Not an admin.' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const adminToken = jwt.sign(
      { role: admin.role },
      process.env.ADMIN_TOKEN,
      { expiresIn: '1h' }
    );

    const adminData = admin.toObject();
    delete adminData.password;
    delete adminData._id; 

    res.status(200).json({
      message: 'Login successful',
      adminToken,
      admin: adminData
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    res.status(500).json({ message: 'Internal server error', status: error });
  }
};



// Admin Register Controller
const registerAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
    });

    await newAdmin.save();
    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    console.error('Error during admin registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get Admin Stats
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const enrolledCourse = await Transaction.countDocuments();

    res.status(200).json({
      totalUsers,
      totalCourses,
      enrolledCourse,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Error fetching admin stats' });
  }
};

// Get All Courses
const GetAllcourse = async (req, res) => {
  try {
    const courses = await Course.find({});
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Add a Course
const addCourse = async (req, res) => {
  const { courseId, courseName, courseDescription, subjectId, amount } = req.body;

  try {
    const newCourse = new Course({
      courseId,
      courseName,
      courseDescription,
      subjectId,
      amount,
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course added successfully!' });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ message: 'Error adding course' });
  }
};

// Edit a Course
const editCourse = async (req, res) => {
  const { courseId } = req.params;
  const { courseName, courseDescription, subjectId, amount } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    course.courseName = courseName || course.courseName;
    course.courseDescription = courseDescription || course.courseDescription;
    course.subjectId = subjectId || course.subjectId;
    course.amount = amount || course.amount;

    await course.save();
    res.status(200).json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error editing course:', error);
    res.status(500).json({ message: 'Error editing course' });
  }
};

// Delete a Course
const deleteCourse = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
};


const registerUserByAdmin = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      age,
      gender,
      pincode,
      whatsappno, // Corrected the field name
      mobileno,
      batchno,
    } = req.body;

    // Check if email, WhatsApp number, or mobile number already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { whatsappno }, { mobileno }], // Corrected the field name
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generate a studentId based on pincode
    const studentIdBase = pincode.toString();
    let uniqueCounter = 1;
    let studentId = `${studentIdBase}${uniqueCounter}`;

    // Ensure studentId is unique in the database
    while (await User.findOne({ studentId })) {
      uniqueCounter++;
      studentId = `${studentIdBase}${uniqueCounter}`;
    }

    // Hash the password
    const hashpwd = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await User.create({
      studentId,
      name,
      password: hashpwd,
      email,
      age,
      pincode,
      gender,
      mobileno,
      whatsappno, // Corrected the field name
      batchno,
    });

    // Setup nodemailer to send email to the user
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'dharaneedharanchinnusamy@gmail.com', // Your Gmail address
        pass: process.env.PASS, // Use environment variable for password
      },
    });

    const mailOptions = {
      from: 'dharaneedharanchinnusamy@gmail.com',
      to: newUser.email,
      subject: 'Welcome to Our Service!',
      text: `Hello ${newUser.name},\n\nThank you for registering. Here are your credentials:\n\nEmail: ${newUser.email}\nPassword: ${password}\n\nYou have been allocated to this batch No: ${batchno}. We recommend that you change your password after logging in for the first time.\n\nBest regards,\nYour App Team`,
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending registration email:', error);
        return res.status(500).json({
          message: 'User registered but failed to send email',
        });
      }

      console.log('Registration email sent:', info.response);
      res
        .status(200)
        .json({ message: 'User registered successfully and email sent' });
    });
  } catch (error) {
    console.error('Error registering user by admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user details by studentId
const updateUserDetails = async (req, res) => {
  const { studentId } = req.params;
  const { name, email, age, mobileno, batchno } = req.body;

  try {
    // Find user by studentId and update details
    const updatedUser = await User.findOneAndUpdate(
      { studentId }, // Find the user by studentId
      { name, email, age, mobileno, batchno }, // Fields to update
      { new: true, runValidators: true } // Return updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully', updatedUser });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Failed to update user details' });
  }
};

  // Edit a question
const editQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedQuestion = await Question.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(updatedQuestion);
  } catch (error) {
    console.error('Error editing question:', error);
    res.status(500).json({ message: 'Failed to edit question' });
  }
};

// Delete a question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Failed to delete question' });
  }
};


const addQuestion = async (req, res) => {
  try {
    const { courseId, questions } = req.body;

    const savedQuestions = await Promise.all(questions.map(async (question) => {
      const newQuestion = new Question({
        courseId,
        questionText: question.questionText,
        answerType: question.answerType,
        options: question.options.map(option => ({ optionText: option.optionText }))
      });

      return await newQuestion.save();
    }));

    res.status(201).json({ message: 'Questions added successfully!', savedQuestions });
  } catch (error) {
    console.error('Error adding questions:', error);
    res.status(500).json({ message: 'Failed to add questions', error: error.message });
  }
};

//unlock the course 
const unlockCourse = async (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res.status(400).json({ message: 'Student ID and Course ID are required.' });
  }

  try {
    // Find the user by studentId
    const user = await User.findOne({ studentId: studentId });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the course is already unlocked
    if (user.approvedCourses.includes(courseId)) {
      return res.status(400).json({ message: 'Course is already unlocked for this user.' });
    }

    // Add the courseId to the user's approvedCourses array
    user.approvedCourses.push(courseId);

    // Save the updated user document
    await user.save();

    return res.status(200).json({
      message: 'Course successfully unlocked for the user.',
      approvedCourses: user.approvedCourses,
    });
  } catch (error) {
    console.error('Error unlocking course:', error);
    return res.status(500).json({ message: 'An error occurred while unlocking the course.', error });
  }
};

const getAllCourseRequests = async (req, res) => {
  try {
   
    const pendingRequests = await RequestandApprove.find({ approve: false }) 
      .populate('studentId', 'name email studentId mobileno') 
      .populate('courseId', 'courseName') 
      .lean(); 

      const approvedRequests = await RequestandApprove.find({ approve: true, COurseComplete: false })
      .populate('studentId', 'name email studentId mobileno')
      .populate('courseId', 'courseName')
      .lean();

    const formattedPendingRequests = pendingRequests.map(request => ({
      _id: request._id,
      userName: request.name, 
      userEmail: request.email, 
      mobileno: request.mobileno, 
      studentId: request.studentId,
      courseId: request.courseId,
      courseName: request.courseName,
      approve: request.approve,
      batchNumber: request.Bacthno || 'N/A', 
      transactionDate: request.transactionDate,
    }));

    const formattedApprovedRequests = approvedRequests.map(request => ({
      _id: request._id,
      userName: request.name,
      userEmail: request.email,
      mobileno: request.mobileno, 
      studentId: request.studentId,
      courseId: request.courseId,
      courseName: request.courseName,
      approve: request.approve,
      batchNumber: request.Bacthno || 'N/A',
      transactionDate: request.transactionDate,
    }));

   
    res.status(200).json({
      pendingRequests: formattedPendingRequests,
      approvedRequests: formattedApprovedRequests
    });
  } catch (error) {
    console.error('Error fetching all course requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const completeCourse = async (req, res) => {
  const { courseId, studentId } = req.body;
  
  // Debugging information
  console.log(`Marking course as complete for Student ID: ${studentId} and Course ID: ${courseId}`);

  try {
    // Find the course request by studentId and courseId
    const courseRequest = await RequestandApprove.findOne({ studentId: studentId, courseId });

    // Check if the course request exists
    if (!courseRequest) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    // Check if the course is already completed
    if (courseRequest.COurseComplete) {
      return res.status(400).json({ message: 'Course already marked as complete' });
    }

    // Mark the course as complete and set the completed date
    courseRequest.COurseComplete = true;
    courseRequest.completedAt = new Date();  // Ensure Date type is used

    // Save the updated course request
    await courseRequest.save();

    return res.status(200).json({ message: 'Course marked as complete successfully' });
  } catch (error) {
    // Log any errors
    console.error('Error completing course:', error);
    
    return res.status(500).json({ message: 'An error occurred while completing the course' });
  }
};


const approveCourseRequest = async (req, res) => {
  const { studentId, courseId } = req.body; // Expect the userId and courseId to be passed in the request body
      console.log("Approve for : ",studentId,courseId);
  if (!studentId || !courseId) {
    return res.status(400).json({ message: 'User ID and Course ID are required' });
  }

  try {
    // Find the course request in the RequestandApprove collection
    const request = await RequestandApprove.findOne({ studentId: studentId, courseId });

    if (!request) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    // Check if the course has already been approved
    if (request.approve) {
      return res.status(400).json({ message: 'Course already approved' });
    }

    // Only approve after all checks and operations are successful
    request.approve = true;
    request.approvedAt = Date.now(); // Store the current time as the approvedAt timestamp

    // Save the updated request
    await request.save();

    return res.status(200).json({ message: 'Course approved successfully' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      // Handle the case where an invalid ObjectId is provided
      return res.status(400).json({ message: 'Invalid User ID or Course ID format' });
    }
    console.error('Error approving course request:', error);
    return res.status(500).json({ message: 'Error approving course request', error });
  }
};

const denyCourseRequest = async (req, res) => {
  const { studentId, courseId } = req.body; // Expect the userId and courseId in the request body
console.log(studentId,courseId)
  if (!studentId || !courseId) {
    return res.status(400).json({ message: 'User ID and Course ID are required' });
  }

  try {
    // Find the course request in the RequestandApprove collection
    const request = await RequestandApprove.findOne({ studentId: studentId, courseId });

    if (!request) {
      return res.status(404).json({ message: 'Course request not found' });
    }

    // Delete the course request (or mark it as denied based on your requirements)
    await RequestandApprove.deleteOne({ studentId: studentId, courseId });

    return res.status(200).json({ message: 'Course request denied successfully' });
  } catch (error) {
    console.error('Error denying course request:', error);
    return res.status(500).json({ message: 'Error denying course request', error });
  }
};

const getUserResponses = async (req, res) => {
  const { studentId } = req.params;
  try {
    const responses = await Response.findOne({ studentId: parseInt(studentId) });
    
    if (!responses) {
      return res.status(404).json({ message: 'No responses found for this student' });
    }

    // Prepare response data
    const responseData = {
      studentId: responses.studentId,
      totalResponses: responses.responses.length,
      responses: responses.responses.map((response) => ({
        questionText: response.questionText,
        answer: response.answer,
        responseDate: response.responseDate
      }))
    };

    // Create the analytics aggregation pipeline
    const aggregatePipeline = [
      {
        $match: {
          studentId: parseInt(studentId), // Match documents by studentId
        },
      },
      { $unwind: "$responses" }, // Unwind the responses array to process each response individually
      {
        $group: {
          _id: "$responses.questionText", // Group by questionText
          questionText: { $first: "$responses.questionText" },
          answerType: { $first: "$responses.answerType" },
          yesCount: {
            $sum: {
              $cond: [{ $eq: ["$responses.answer", "Yes"] }, 1, 0], // Count 'Yes' answers for yes-no questions
            },
          },
          noCount: {
            $sum: {
              $cond: [{ $eq: ["$responses.answer", "No"] }, 1, 0], // Count 'No' answers for yes-no questions
            },
          },
          multipleChoiceCounts: {
            $push: {
              $cond: [
                { $eq: ["$responses.answerType", "multiple-choice"] },
                "$responses.answer",
                null,
              ],
            },
          },
          shortTextResponses: {
            $push: {
              $cond: [
                { $eq: ["$responses.answerType", "short-text"] },
                "$responses.answer",
                null,
              ],
            },
          },
          allAnswers: { $push: "$responses.answer" }, // Collect all answers
          responseDates: { $push: "$responses.responseDate" }, // Collect response dates
        },
      },
      {
        $project: {
          _id: 0, // Do not return _id field
          questionText: 1,
          answerType: 1,
          yesCount: 1,
          noCount: 1,
          allAnswers: 1, // Include all answers
          responseDates: 1, // Include response dates
          multipleChoiceCounts: {
            $filter: {
              input: "$multipleChoiceCounts",
              as: "answer",
              cond: { $ne: ["$$answer", null] },
            },
          },
          shortTextResponses: {
            $filter: {
              input: "$shortTextResponses",
              as: "response",
              cond: { $ne: ["$$response", null] },
            },
          },
        },
      },
    ];

    // Execute the aggregation
    const analyticsResults = await Response.aggregate(aggregatePipeline).exec();

    // Prepare additional metadata or statistics if needed
    const responseMetadata = {
      totalQuestions: analyticsResults.length,
      totalYesResponses: analyticsResults.reduce((sum, question) => sum + question.yesCount, 0),
      totalNoResponses: analyticsResults.reduce((sum, question) => sum + question.noCount, 0),
      totalMultipleChoiceResponses: analyticsResults.reduce((sum, question) => sum + question.multipleChoiceCounts.length, 0),
      totalShortTextResponses: analyticsResults.reduce((sum, question) => sum + question.shortTextResponses.length, 0),
    };

    // Combine response data and analytics results
    const combinedData = {
      responseData,
      analytics: {
        analyticsResults,
        metadata: responseMetadata,
      }
    };

    // Send the combined data to the frontend
    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching responses and analytics:', error);
    res.status(500).json({ message: 'Error fetching responses and analytics' });
  }
};


module.exports = {
  loginAdmin,
  registerAdmin,
};