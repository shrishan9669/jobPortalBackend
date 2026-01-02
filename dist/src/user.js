import { Router } from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { signJwt } from "./utils/jwt.js";
import { prisma } from './Prisma/client.js';
import { requireAuth } from "./middleware/employee.js";
import { requireAuthEmployer } from "./middleware/employer.js";
const userRouter = Router();
userRouter.delete('/deleteEmployee', async (req, res) => {
    await prisma.user.deleteMany({});
    return res.json({
        msg: `Deleted Email ${'bpguna11@gmail.com'}`
    });
});
userRouter.post('/UserCreate', async (req, res) => {
    const body = req.body;
    console.log(body);
    if (!body.name || !body.email || !body.phone || !body.password || !body.location || !body.experience || !body.roles || !body.preferedLocations) {
        return res.status(500).json({
            msg: "All fields are required!!"
        });
    }
    try {
        const exists = await prisma.user.findUnique({
            where: {
                email: body.email
            }
        });
        if (exists) {
            return res.json({
                msg: "User Already exists!!"
            });
        }
        const NewUser = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                password: body.password,
                experience: body.experience,
                location: body.location,
                roles: body.roles,
                preferedLocations: body.preferedLocations
            }
        });
        console.log(NewUser);
        return res.json({
            NewUser, msg: "User created."
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/userUpdate', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User Failed"
        });
    }
    const { name, phone, experience, email, location, availability, prefRoles, prefLocations } = req.body;
    console.log("This is default body " + req.body);
    try {
        const Updating = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                name,
                phone,
                availability,
                experience,
                email,
                location,
                roles: prefRoles,
                preferedLocations: prefLocations
            }
        });
        return res.json({
            ok: true,
            msg: "User Information Updated Successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/Signin', async (req, res) => {
    const { emailid, password } = req.query;
    console.log(emailid + password);
    if (!emailid || !password) {
        return res.json({
            ok: false,
            msg: "One of the fields is missing!!"
        });
    }
    try {
        const IsReal = await prisma.user.findUnique({
            where: {
                email: emailid,
                password: password
            }
        });
        if (!IsReal) {
            // ❌ User exists nahi → error response
            return res.status(404).json({ msg: "User doesn't exist", ok: false });
        }
        // 3️⃣ User exists → login successful
        const jwtToken = signJwt({ id: IsReal.id, email: IsReal.email });
        console.log("This is jwt token " + jwtToken);
        return res.json({
            ok: true,
            name: IsReal.name,
            email: IsReal.email,
            token: jwtToken
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.get("/forgetLogin", async (req, res) => {
    const { email } = req.query;
    console.log(email);
    if (!email) {
        return res.status(500).json({
            msg: "Email required!!"
        });
    }
    try {
        const exist = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (exist) {
            return res.json({
                real: true
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.put('/changePassword', async (req, res) => {
    const { newpass, email } = req.body;
    console.log("Newpass and email" + email + " " + newpass);
    if (!newpass || !email) {
        return res.json({
            msg: "Newpass and email are required!!"
        });
    }
    try {
        const Changing = await prisma.user.update({
            where: {
                email: email
            },
            data: {
                password: newpass
            }
        });
        console.log(Changing);
        return res.json({
            msg: "Password changed!!"
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            error: err
        });
    }
});
// Sending An otp
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "bpguna11@gmail.com", // 👈 your Gmail
        pass: "tcpd eouy gqkz tnfq", // 👈 not your real password (see below)
    },
});
userRouter.get("/sendOtp", async (req, res) => {
    const { email } = req.query;
    const otp = crypto.randomInt(100000, 999999); // generate 6-digit OTP
    console.log(email);
    if (!email) {
        return res.status(500).json({
            msg: "Email required!!"
        });
    }
    try {
        const exist = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!exist) {
            return res.json({
                real: false
            });
        }
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"} `,
            to: email,
            subject: "Your OTP Code",
            html: `<p>Your OTP is <b>${otp}</b>. It will expire in 5 minutes.</p>`,
        };
        await transporter.sendMail(mailOptions);
        const token = signJwt({ id: exist.id, email: exist.id });
        res.json({
            real: true,
            otp,
            token
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
userRouter.post('/google-login', async (req, res) => {
    try {
        const { token } = req.body; // token is Google id_token from frontend
        if (!token)
            return res.status(400).json({ ok: false, msg: "id_token missing" });
        // verify token with google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID || ""
        });
        const payload = ticket.getPayload();
        console.log("Here is your payload " + payload);
        if (!payload)
            return req.status(401).json({ ok: false, msg: "Invalid google token" });
        const email = payload.email;
        if (!email)
            return res.status(400).json({ ok: false, msg: "Email not available in token" });
        // check existing user by email
        let user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!user) {
            // ❌ User exists nahi → error response
            return res.status(404).json({ ok: false, msg: "User doesn't exist!!" });
        }
        // 3️⃣ User exists → login successful
        const jwtToken = signJwt({ id: user.id, email: user.email });
        console.log("This is jwt token " + jwtToken);
        //  res.cookie("token", jwtToken, {
        //   httpOnly: true,
        //   secure: process.env.NODE_ENV === "production",
        //   sameSite: "lax",
        //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        // });
        return res.json({ ok: true, name: user.name, email: user.email, token: jwtToken });
    }
    catch (err) {
        console.error("Google login error:", err);
        return res.status(500).json({ ok: false, error: "Authentication failed" });
    }
});
// userRouter.post("/logout", (req:any, res:any) => {
//   res.clearCookie("token", {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "lax",
//   });
//   res.json({ ok: true });
// });
userRouter.get('/BasicDetails', requireAuth, async (req, res) => {
    const { id } = req.user;
    console.log(req.user);
    if (!id) {
        return res.json({
            msg: "Id not found!!"
        });
    }
    try {
        const User = await prisma.user.findUnique({
            where: {
                id: id
            }
        });
        return res.json({
            ok: true,
            user: User
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/disability', requireAuth, async (req, res) => {
    const { disability, email } = req.body;
    if (!disability || !email) {
        return res.json({
            msg: "Data required!!"
        });
    }
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                disability: disability
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.get('/getDisability', requireAuth, async (req, res) => {
    const email = req.query.email;
    if (!email) {
        return res.json({
            msg: "Email required to get disability"
        });
    }
    try {
        const Got = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        return res.json({
            disability: Got?.disability,
            militaryExp: Got?.militaryExp,
            careerBreak: Got?.careerBreak
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.put('/setDiversity', requireAuth, async (req, res) => {
    const { militaryExp, careerBreak, email } = req.body;
    if (!militaryExp || !careerBreak || !email) {
        return res.json({
            msg: "All fields are required!!"
        });
    }
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                militaryExp, careerBreak
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
// Getting textual Content
userRouter.put('/ProfileSummary', requireAuth, async (req, res) => {
    const { Data, email } = req.body;
    if (!Data || !email) {
        return res.json({
            msg: "Didn't get Data"
        });
    }
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                profileSummary: Data
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.put('/ResumeHeadline', requireAuth, async (req, res) => {
    const { Data, email } = req.body;
    if (!Data || !email) {
        return res.json({
            msg: "Didn't get Data"
        });
    }
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                resumeHeadline: Data
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
// Getting Reusable Div Data
userRouter.get('/Summary', requireAuth, async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.json({
            msg: "Didn't get Data"
        });
    }
    try {
        const Data = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                profileSummary: true
            }
        });
        return res.json({
            ok: true,
            Data: Data?.profileSummary
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/continuous', async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            email: "bpguna11@gmail.com"
        },
        select: {
            id: true
        }
    });
    return res.json({
        ok: true,
        user
    });
});
userRouter.get('/resume_headline', requireAuth, async (req, res) => {
    const { email } = req.user;
    if (!email) {
        return res.json({
            msg: "Required email"
        });
    }
    try {
        const User = await prisma.user.findUnique({
            where: {
                email: email
            },
            select: {
                resumeHeadline: true
            }
        });
        return res.json({
            ok: true,
            headline: User?.resumeHeadline
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getKeySkills', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "Id required!!"
        });
    }
    try {
        const Data = await prisma.keySkills.findUnique({
            where: {
                userKeyId: Number(id)
            },
            select: {
                skillSet: true
            }
        });
        console.log(Data);
        return res.json({
            ok: true,
            skills: Data?.skillSet || []
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/postKeySkills', requireAuth, async (req, res) => {
    const { id } = req.user;
    const { skills } = req.body;
    if (!id || !skills || !Array.isArray(skills)) {
        return res.json({
            msg: "Id required!!"
        });
    }
    try {
        //check if it exists already
        const Exist = await prisma.keySkills.findUnique({
            where: {
                userKeyId: Number(id)
            }
        });
        let result;
        if (Exist) {
            result = await prisma.keySkills.update({
                where: {
                    userKeyId: Number(id)
                },
                data: {
                    skillSet: skills
                }
            });
        }
        else {
            result = await prisma.keySkills.create({
                data: {
                    userKeyId: Number(id),
                    skillSet: skills
                }
            });
        }
        return res.json({
            msg: Exist ? 'Skills updated successfully' : 'Skills added successfully',
            data: result,
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/postPersonalDetails', requireAuth, async (req, res) => {
    const { id } = req.user;
    const FinalData = req.body.finalData;
    if (!id) {
        return res.json({
            msg: "Id required!!"
        });
    }
    try {
        // 🧩 Convert date from frontend to JS Date object (if exists)
        let parsedDate = null;
        if (FinalData.dateOfBirth) {
            // If frontend sends something like { date: "10", month: "07", year: "2003" }
            const { date, month, year } = FinalData.dateOfBirth;
            if (date && month && year) {
                parsedDate = new Date(`${year}-${month}-${date}`);
            }
        }
        // check if entry exist or not 
        const ExistPersonal = await prisma.userPersonalDetails.findUnique({
            where: {
                userId: Number(id)
            }
        });
        if (ExistPersonal) {
            await prisma.userPersonalDetails.update({
                where: {
                    userId: Number(id)
                },
                data: {
                    gender: FinalData.gender || null,
                    category: FinalData.category || null,
                    maritalStatus: FinalData.maritalStatus || null,
                    moreInfo: FinalData.moreInfo || [],
                    permanentAddress: FinalData.parmanentAddress || null,
                    hometown: FinalData.hometown || null,
                    pincode: FinalData.pincode || null,
                    dateofBirth: parsedDate
                }
            });
            if (FinalData.languageArr && Array.isArray(FinalData.languageArr)) {
                // Delete previous languages to avoid duplicates
                await prisma.languageProficiency.deleteMany({
                    where: { userDetailId: Number(ExistPersonal?.id) },
                });
                await Promise.all(FinalData.languageArr.map(async (element) => {
                    await prisma.languageProficiency.create({
                        data: {
                            userDetailId: Number(ExistPersonal?.id),
                            language: element.language || null,
                            proficiency: element.proficiency || null,
                            canRead: element.ableArray.includes('Read') ? true : false,
                            canWrite: element.ableArray.includes('Write') ? true : false,
                            canSpeak: element.ableArray.includes('Speak') ? true : false,
                        }
                    });
                }));
            }
        }
        else {
            const NewPersonal = await prisma.userPersonalDetails.create({
                data: {
                    userId: Number(id),
                    gender: FinalData.gender || "",
                    category: FinalData.category || "",
                    maritalStatus: FinalData.maritalStatus || "",
                    moreInfo: FinalData.moreInfo || [],
                    permanentAddress: FinalData.parmanentAddress || "",
                    hometown: FinalData.hometown || "",
                    pincode: FinalData.pincode || ""
                }
            });
            if (FinalData.languageArr && Array.isArray(FinalData.languageArr)) {
                await Promise.all(FinalData.languageArr.map(async (element) => {
                    await prisma.languageProficiency.create({
                        data: {
                            userDetailId: Number(NewPersonal?.id),
                            language: element.language || null,
                            proficiency: element.proficiency || null,
                            canRead: element.ableArray.includes('Read') ? true : false,
                            canWrite: element.ableArray.includes('Write') ? true : false,
                            canSpeak: element.ableArray.includes('Speak') ? true : false,
                        }
                    });
                }));
            }
        }
        return res.json({
            ok: true,
            msg: "Personal details saved successfully ✅"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.get("/getPersonalDetails", requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "Id is required!!"
        });
    }
    try {
        const Personal = await prisma.userPersonalDetails.findUnique({
            where: {
                userId: Number(id)
            }
        });
        const Language = await prisma.languageProficiency.findMany({
            where: {
                userDetailId: Number(Personal?.id)
            }
        });
        console.log("Language array -> " + Language);
        return res.json({
            data: { Language, Personal }
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post("/IT_Skills", requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "Id is required!!"
        });
    }
    const { skill, version, lastused, expYears, expMonths, rowId } = req.body;
    if (!skill) {
        return res.json({
            msg: "Skill required!!"
        });
    }
    try {
        if (rowId) {
            await prisma.iTSkills.update({
                where: {
                    id: Number(rowId)
                },
                data: {
                    skill: skill,
                    lastused: lastused || "",
                    version: version || "",
                    expMonths: expMonths || "",
                    expYears: expYears || ""
                }
            });
            return res.json({
                ok: true,
                msg: "Skill updated successfully!!"
            });
        }
        // When skill/software already exist
        const Exist = await prisma.iTSkills.findFirst({
            where: {
                userKeyId: Number(id),
                skill: skill
            }
        });
        if (Exist) {
            return res.json({
                msg: `Skill ${skill} already exists!!`
            });
        }
        await prisma.iTSkills.create({
            data: {
                userKeyId: Number(id),
                skill: skill,
                lastused: lastused || "",
                version: version || "",
                expMonths: expMonths || "",
                expYears: expYears || ""
            }
        });
        return res.json({
            ok: true,
            msg: "Skill added successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.get('/getItSkills', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "ID required"
        });
    }
    try {
        const AllSkills = await prisma.iTSkills.findMany({
            where: {
                userKeyId: Number(id)
            }
        });
        return res.json({
            ok: true,
            AllSkills
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/postEmployment', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "ID required!!"
        });
    }
    const { salary, totalExp, joiningDate, tillDate, profile, department, companyName, jobTitle, notice, skills } = req.body;
    try {
        await prisma.employment.create({
            data: {
                userKeyId: Number(id),
                skills: skills,
                company: companyName,
                jobTitle: jobTitle,
                totalExpMonth: String(totalExp.months),
                totalExpYear: String(totalExp.years),
                joinMonth: String(joiningDate.months),
                joinYear: String(joiningDate.years),
                tillMonth: String(tillDate.months),
                tillYear: String(tillDate.years),
                salary: salary,
                department: department,
                jobProfile: profile,
                noticePeriod: notice
            }
        });
        return res.json({
            ok: true,
            msg: "Employee data created successfully!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post('/postEducation', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "ID required!!"
        });
    }
    const { education, medium, board, gradingSystem, courseType, university, marks, passout, duration, course, rowId } = req.body;
    try {
        const exist = await prisma.education.findFirst({
            where: {
                education: education,
                userKeyId: Number(id)
            }
        });
        if (rowId) {
            await prisma.education.update({
                where: {
                    id: Number(rowId)
                },
                data: {
                    userKeyId: Number(id),
                    education: education,
                    marks: marks,
                    courseType: courseType,
                    course: course,
                    passout: passout,
                    medium: medium,
                    board: board,
                    gradingSystem: gradingSystem,
                    startingCourse: duration.starting,
                    endingCourse: duration.ending,
                    university: university
                }
            });
            return res.json({
                ok: true,
                msg: "Record successfully updated!!"
            });
        }
        if (exist) {
            return res.json({
                msg: `${education} details already exist for this user.`
            });
        }
        await prisma.education.create({
            data: {
                userKeyId: Number(id),
                education: education,
                marks: marks,
                courseType: courseType,
                course: course,
                passout: passout,
                medium: medium,
                board: board,
                gradingSystem: gradingSystem,
                startingCourse: duration.starting,
                endingCourse: duration.ending,
                university: university
            }
        });
        return res.json({
            ok: true,
            msg: "Education successfully created!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getEducation', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "Id is required!!"
        });
    }
    try {
        const education = await prisma.education.findMany({
            where: {
                userKeyId: Number(id)
            }
        });
        res.json({
            ok: true,
            education
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post('/postProjects', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "ID required!!",
            ok: false
        });
    }
    const { status, workedFrom, title, client, description, skillused } = req.body;
    try {
        await prisma.projects.create({
            data: {
                userKeyId: Number(id),
                status,
                startMonth: String(workedFrom.months),
                startYear: String(workedFrom.years),
                client,
                skillsUsed: skillused,
                description,
                projectTitle: title,
            }
        });
        return res.json({
            ok: true,
            msg: "Project added successfully!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.delete('/deleteProject', requireAuth, async (req, res) => {
    const { projectRowId } = req.query;
    if (!projectRowId) {
        return res.json({
            ok: false,
            msg: "Project RowId Required!!"
        });
    }
    try {
        await prisma.projects.delete({
            where: {
                id: Number(projectRowId)
            }
        });
        return res.json({
            msg: "Project Removed!!",
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getProjects', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            msg: "Id required!",
            ok: false
        });
    }
    try {
        const projects = await prisma.projects.findMany({
            where: {
                userKeyId: Number(id)
            }
        });
        return res.json({
            projects,
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
// Store verification tokens (in production use Redis/Database)
const verificationTokens = new Map();
userRouter.post('/VerifyEmailLink', requireAuth, async (req, res) => {
    const { email } = req.user;
    if (!email) {
        return res.json({
            msg: "Problem with authentication!!",
            ok: false
        });
    }
    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const verificationLink = `http://localhost:5173/verify-email?token=${token}&email=${email}`;
    // store token with expiry(1 hour)
    verificationTokens.set(email, {
        token,
        expiresAt: Date.now() + 3600000 // 1 hour
    });
    try {
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"}`,
            to: email,
            subject: "Verification of Email Address.",
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">YuvaJobs</h1>
              <p style="color: #6b7280; margin: 5px 0;">Get app</p>
            </div>
            
            <hr style="border: none; border-top: 2px solid #e5e7eb; margin: 20px 0;">
            
            <h2 style="color: #1f2937; text-align: center;">
              Verify your email ID ${email} to get contacted by recruiters!
            </h2>
            
            <div style="margin: 30px 0;">
              <div style="display: flex; align-items: flex-start; margin-bottom: 15px;">
                <div style="background: #10b981; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">✓</div>
                <p style="margin: 0; color: #374151;">Companies prefer candidates with verified profiles</p>
              </div>
              
              <div style="display: flex; align-items: flex-start;">
                <div style="background: #10b981; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">✓</div>
                <p style="margin: 0; color: #374151;">40% higher chances of getting contacted by active recruiters</p>
              </div>
            </div>
            
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
            Verify your email id
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
          </div>
        `,
        };
        await transporter.sendMail(mailOptions);
        res.json({ ok: true, msg: 'Verification email sent' });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/verify-email', async (req, res) => {
    const { token, email } = req.query;
    const storedData = verificationTokens.get(email);
    console.log("Entered Verification");
    if (!storedData || storedData.token !== token || Date.now() > storedData.expiresAt) {
        verificationTokens.delete(email);
        return res.json({
            ok: false,
            msg: "Verification Failed!!"
        });
    }
    //token is valid - update user in database
    try {
        await prisma.user.update({
            where: {
                email: email
            },
            data: {
                emailVerify: 'Verified'
            }
        });
        console.log("Verified");
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
//..........................................................................................
// Emploer Side.....................
userRouter.post('/sendMailOtp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({
            ok: false,
            msg: "Email required!!"
        });
    }
    const otp = crypto.randomInt(100000, 999999); // generate 6-digit OTP
    try {
        const User = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        if (!User) {
            return res.json({
                ok: false,
                msg: "User doesn't exist!!"
            });
        }
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"}`,
            to: email,
            subject: "OTP Confirmation.",
            html: `Your OTP is ${otp}`,
        };
        await transporter.sendMail(mailOptions);
        const token = signJwt({ id: User.id, email: User.email });
        console.log("This is jwt token " + token);
        return res.json({
            ok: true,
            otp,
            token
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post('/employPreDetails', async (req, res) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
        return res.json({
            ok: false,
            msg: "All fields are  required!!"
        });
    }
    const otp = crypto.randomInt(100000, 999999); // generate 6-digit OTP
    try {
        // Posting Create
        const Employer = await prisma.employer.create({
            data: {
                email: email,
                name: name,
                password: password
            }
        });
        console.log(Employer);
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"}`,
            to: email,
            subject: "OTP Confirmation.",
            html: `Your OTP is ${otp}`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({
            ok: true,
            otp
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/emailVerify', async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return req.json({
            ok: false,
            msg: "Email required to verify"
        });
    }
    try {
        await prisma.employer.update({
            where: {
                email
            },
            data: {
                emailVerify: true
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return req.json({
            error: err
        });
    }
});
userRouter.post('/employPostDetails', async (req, res) => {
    const { email, hiringfor, designation, industry, company, employees, pincode, address, phone } = req.body;
    if (!email) {
        return res.json({
            ok: false,
            msg: "Email required!!"
        });
    }
    try {
        await prisma.employer.update({
            where: {
                email
            },
            data: {
                hiringfor: hiringfor,
                designation,
                companyAddress: address,
                phone,
                noOfEmployees: employees,
                company,
                pincode,
                industry
            }
        });
        return res.json({
            ok: true,
            msg: "Details recorded!! Employer Created!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get("/checkVerify", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.json({
            ok: false,
            msg: "Email required!!"
        });
    }
    try {
        const Checking = await prisma.employer.findUnique({
            where: {
                email
            },
            select: {
                emailVerify: true
            }
        });
        if (!Checking) {
            return res.json({
                verify: false
            });
        }
        if (Checking.emailVerify) {
            return res.json({
                verify: true
            });
        }
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post('/employerLogin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({
            login: false,
            msg: "Email and password Required!!"
        });
    }
    const otp = crypto.randomInt(100000, 999999); //Otp generate
    try {
        const Exist = await prisma.employer.findUnique({
            where: {
                email,
                password
            }
        });
        if (!Exist) {
            return res.json({
                login: false,
                msg: "User doesn't exist"
            });
        }
        const token = signJwt({ id: Exist.id, email: Exist.email });
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"}`,
            to: email,
            subject: "OTP Confirmation for Login Process.",
            html: `Hi ${Exist.name}. Your OTP for Extra login security is ${otp}`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({
            login: true,
            token,
            otp
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/ResendOTP', async (req, res) => {
    const otp = crypto.randomInt(100000, 999999);
    const { email } = req.query;
    if (!email) {
        return res.json({
            ok: false,
            msg: "Email required!!"
        });
    }
    try {
        const mailOptions = {
            from: `"YuvaJobs" ${"bpguna11@gmail.com"}`,
            to: email,
            subject: "OTP Confirmation.",
            html: `Your OTP is ${otp}`,
        };
        await transporter.sendMail(mailOptions);
        return res.json({
            ok: true,
            otp
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
// Job Posting
// Required Auth
userRouter.post('/postingJob', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem with authentication"
        });
    }
    const { description, workmode, employmentType, salary, currency, title, company, experience, location, deadline, vacancies, role, skills, requirements, responsibilities, education } = req.body;
    for (const [key, value] of Object.entries(req.body)) {
        if (key !== "description" && (!value || String(value).trim() === "")) {
            return res.status(400).json({ error: `${key} is required` });
        }
    }
    try {
        const Posting = await prisma.job.create({
            data: {
                employerId: Number(id),
                workMode: workmode,
                employmentType,
                experience,
                applicationDeadline: deadline,
                company,
                title,
                description,
                salary: Number(salary),
                openings: Number(vacancies),
                role,
                location,
                currency,
                skills: skills,
                requirements,
                responsibilities,
                education
            }
        });
        console.log(Posting);
        return res.json({
            ok: true,
            msg: "Job Posted Successfully"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getAllJobs', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Required Id"
        });
    }
    try {
        const jobs = await prisma.job.findMany({
            where: {
                employerId: Number(id)
            }
        });
        return res.json({
            ok: true,
            jobs
        });
    }
    catch (err) {
        console.log(err);
    }
});
userRouter.delete('/deleteAJob', requireAuthEmployer, async (req, res) => {
    const { rowId } = req.query;
    if (!rowId) {
        return res.json({
            ok: false,
            msg: "Row id required!!"
        });
    }
    try {
        await prisma.job.delete({
            where: {
                id: Number(rowId)
            }
        });
        return res.json({
            ok: true,
            msg: "Job Deleted"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post("/updateJob", requireAuthEmployer, async (req, res) => {
    const { id, newJob } = req.body;
    if (!id || !newJob) {
        return res.json({
            ok: false,
            msg: "No data found to be updated"
        });
    }
    const UpdatedObj = {
        title: newJob.title,
        company: newJob.company,
        description: newJob.description,
        employmentType: newJob.employmentType,
        workMode: newJob.workMode,
        experience: newJob.experience,
        role: newJob.role,
        salary: Number(newJob.salary),
        currency: newJob.currency,
        location: newJob.location,
        openings: Number(newJob.openings),
        skills: newJob.skills,
        status: newJob.status,
        applicationDeadline: (newJob.deadline)
    };
    try {
        await prisma.job.update({
            where: {
                id: Number(id)
            },
            data: UpdatedObj
        });
        return res.json({
            ok: true,
            msg: "Information updated!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getEmployer', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Employer not found!!"
        });
    }
    try {
        const employer = await prisma.employer.findUnique({
            where: {
                id: Number(id)
            }
        });
        return res.json({
            ok: true,
            employer
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.post('/updateEmployer', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Employer not found!!"
        });
    }
    const { employer } = req.body;
    if (!employer) {
        return res.json({
            ok: false,
            msg: "Employer data not found!!"
        });
    }
    // Only allow specific fields to update
    const allowedFields = [
        'name', 'email', 'designation', 'hiringfor', 'company',
        'industry', 'noOfEmployees', 'companyAddress', 'pincode',
        'phone', 'website', 'founded', 'companyDescription'
    ];
    const updateData = {};
    allowedFields.forEach(field => {
        if (employer[field] !== undefined) {
            updateData[field] = employer[field];
        }
    });
    try {
        await prisma.employer.update({
            where: {
                id: Number(id)
            },
            data: updateData
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
//...................................
//Recommended Jobs
userRouter.get('/recommendedJobs', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User not found!!"
        });
    }
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                ITSkills: true,
                KeySkills: true
            }
        });
        const keySkills = user?.KeySkills?.skillSet || [];
        const itSkills = user?.ITSkills?.map(s => s.skill) || [];
        const allSkills = [...keySkills, ...itSkills];
        const userLocation = user?.preferedLocations;
        const userExperience = user?.experience;
        const userRoles = user?.roles;
        // Matching Jobs On Skills , location , experience , roles
        let matchedJobs = await prisma.job.findMany({
            where: {
                status: 'Active',
                OR: [
                    //Skill matching
                    {
                        skills: {
                            hasSome: allSkills
                        }
                    },
                    // location-based matching
                    {
                        location: {
                            in: userLocation || []
                        }
                    },
                    //Experience matching
                    {
                        experience: {
                            contains: userExperience || '' // Example : "0-1 yrs"
                        }
                    },
                    //Role based matching
                    {
                        role: {
                            in: userRoles || []
                        }
                    },
                    {
                        title: {
                            in: userRoles || []
                        }
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        // All saved jobs
        const savedJobs = await prisma.savedJobs.findMany({
            where: {
                employeeId: Number(id)
            },
            select: {
                jobId: true
            }
        });
        const savedJobIds = new Set(savedJobs.map(each => each.jobId));
        const jobsWithSavedFlag = matchedJobs.map(job => ({
            ...job,
            saved: savedJobIds.has(job.id)
        }));
        return res.json({
            ok: true,
            matchedJobs: jobsWithSavedFlag
        });
    }
    catch (err) {
        console.log(err);
    }
});
userRouter.get('/getJobsForUser', requireAuth, async (req, res) => {
    try {
        const AllJobs = await prisma.job.findMany({});
        console.log(AllJobs);
        return res.json({
            ok: true,
            AllJobs
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getSpecificJob/:jobid', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User authentication problem!!"
        });
    }
    const { jobid } = req.params;
    if (!jobid) {
        return res.json({
            ok: false,
            msg: "Job id Didn't find!!"
        });
    }
    try {
        const job = await prisma.job.findUnique({
            where: {
                id: Number(jobid)
            }
        });
        const FindEmployer = await prisma.employer.findUnique({
            where: {
                id: Number(job?.employerId)
            },
            select: {
                name: true
            }
        });
        const Check_If_Job_Saved = await prisma.savedJobs.findUnique({
            where: {
                employeeId_jobId: {
                    employeeId: Number(id),
                    jobId: Number(job?.id)
                }
            }
        });
        let saved = false;
        if (Check_If_Job_Saved) {
            saved = true;
        }
        const Check_If_Job_Applied = await prisma.applicant.findUnique({
            where: {
                jobId_userId: {
                    jobId: Number(job?.id),
                    userId: Number(id)
                }
            }
        });
        let applied = false;
        if (Check_If_Job_Applied) {
            applied = true;
        }
        const newJob = { ...job, name: FindEmployer?.name, saved, applied };
        return res.json({
            ok: true,
            newJob
        });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            error: err
        });
    }
});
userRouter.post('/savingAJob', requireAuth, async (req, res) => {
    const { employeeEmail, jobId } = req.body;
    if (!employeeEmail || !jobId) {
        return res.json({
            ok: false,
            msg: "Data not found!!"
        });
    }
    try {
        //  finding user for employeeId
        const User = await prisma.user.findUnique({
            where: {
                email: employeeEmail
            }
        });
        const SavingAJob = await prisma.savedJobs.create({
            data: {
                employeeId: Number(User?.id),
                jobId: Number(jobId)
            }
        });
        return res.json({
            ok: true,
            msg: "Job Saved"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getSavedJobs', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Authentication problem!! User not found."
        });
    }
    try {
        const SavedJobs = await prisma.savedJobs.findMany({
            where: {
                employeeId: Number(id)
            },
            include: {
                job: true
            }
        });
        const jobs = SavedJobs.map(each => each.job);
        return res.json({
            ok: true,
            jobs
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.delete('/unsaveJob', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User not found!!"
        });
    }
    const { jobId } = req.body;
    if (!jobId) {
        return res.json({
            ok: false,
            msg: "Data not found!!"
        });
    }
    try {
        await prisma.savedJobs.delete({
            where: {
                employeeId_jobId: {
                    employeeId: Number(id),
                    jobId: Number(jobId)
                }
            }
        });
        return res.json({
            ok: true,
            msg: "Unsaved a job!!"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
// Applicants side Routes
userRouter.post('/createApplicant', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem with Authentication"
        });
    }
    const { jobId } = req.body;
    if (!jobId) {
        return res.json({
            ok: false,
            msg: "Data Not found!!"
        });
    }
    try {
        // finding user for skills and experience
        const ApplyKarneWala = await prisma.user.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                ITSkills: true,
                KeySkills: true,
            }
        });
        if (!ApplyKarneWala) {
            return res.status(404).json({
                ok: false,
                msg: "User not found"
            });
        }
        const Itskills = ApplyKarneWala?.ITSkills.map(each => each.skill) || [];
        const keyskills = ApplyKarneWala?.KeySkills?.skillSet || [];
        const AllSkills = [...Itskills, ...keyskills];
        const Experience = ApplyKarneWala?.experience ?? null;
        // Creating Applicant entry
        const New_Applicant = await prisma.applicant.create({
            data: {
                userId: Number(id),
                jobId: Number(jobId),
                experienceSnapshot: Experience,
                skillsSnapshot: AllSkills,
            }
        });
        return res.json({
            ok: true,
            msg: "Applied to the Job!!"
        });
    }
    catch (err) {
        if (err.code === "P2002") {
            return res.status(400).json({
                ok: false,
                msg: "You already applied for this job"
            });
        }
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getAppliedJob', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User not found!!"
        });
    }
    try {
        // Getting applicantions 
        const AllApplications = await prisma.applicant.findMany({
            where: {
                userId: Number(id)
            },
            include: {
                job: {
                    include: {
                        _count: {
                            select: {
                                Applicants: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                appliedOn: "desc"
            }
        });
        return res.json({
            ok: true,
            jobs: AllApplications.map(applicant => ({
                applicationId: applicant.id,
                status: applicant.status,
                appliedOn: applicant.appliedOn,
                jobTitle: applicant.job.title,
                company: applicant.job.company,
                applicantCount: applicant.job._count.Applicants
            }))
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            ok: false,
            error: err
        });
    }
});
// Employer side 
// Calculating Applicant profile Score
function calculateSkillMatch(jobSkills, userSkills) {
    const normalizedJob = jobSkills.map(s => s.toLowerCase().trim());
    const normalizedUser = userSkills.map(s => s.toLowerCase().trim());
    const matched = normalizedJob.filter(skill => normalizedUser.includes(skill));
    const percentage = (matched.length / normalizedJob.length) * 100;
    return {
        matched,
        missing: normalizedJob.filter(s => !matched.includes(s)),
        percentage: Math.round(percentage)
    };
}
function calculateExperienceScore(requiredMin, requiredMax, applicantExp) {
    if (applicantExp >= requiredMin && applicantExp <= requiredMax)
        return 100;
    if (applicantExp >= requiredMin - 1)
        return 60;
    return 20;
}
function calculateLocationScore(jobLocation, userLocation) {
    if (!userLocation)
        return 50;
    if (jobLocation === "Remote")
        return 100;
    if (userLocation.includes(jobLocation))
        return 100;
    return 40;
}
function calculateProfileScore(user) {
    let score = 0;
    if (user.profileSummary)
        score += 40;
    if (user.resume)
        score += 40;
    if (user.skills?.length >= 5)
        score += 20;
    return score;
}
function calculateFitScore(job, applicant) {
    const skill = calculateSkillMatch(job.skills, applicant.skillsSnapshot);
    const exp = calculateExperienceScore(Number(job.experience.split('-')[0]), Number(job.experience.split('-')[1]), Number(applicant.experienceSnapshot.split('-')[1]));
    const location = calculateLocationScore(job.location, applicant.user.preferedLocations);
    const profile = calculateProfileScore(applicant.user);
    const finalScore = skill.percentage * 0.5 +
        exp * 0.25 +
        10 * 0.1 + // role match (placeholder)
        location * 0.1 +
        profile * 0.05;
    console.log(skill.percentage * 0.5, exp * 0.25, location * 0.1, profile * 0.05);
    return {
        fitScore: Math.round(finalScore),
        matchedSkills: skill.matched,
        missingSkills: skill.missing
    };
}
userRouter.get('/getApplicants', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Employer not found!!"
        });
    }
    try {
        let Applicants = await prisma.applicant.findMany({
            where: {
                job: {
                    employerId: Number(id)
                }
            },
            include: {
                user: {
                    include: {
                        ITSkills: true,
                        KeySkills: true
                    }
                },
                job: true
            }
        });
        Applicants = Applicants.map(each => {
            return { ...each, fitScore: calculateFitScore(each.job, each) };
        });
        return res.json({
            ok: true,
            Applicants
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            ok: false,
            error: err
        });
    }
});
function getNotificationMessage(action, jobTitle, company) {
    switch (action) {
        case "Shortlisted":
            return `Good news! You’ve been shortlisted for ${jobTitle} at ${company}.`;
        case "Rejected":
            return `Your application for ${jobTitle} at ${company} was not selected.`;
        case "interview_scheduled":
            return `Your interview for ${jobTitle} at ${company} has been scheduled.`;
        case "hired":
            return `Congratulations! You’ve been selected for ${jobTitle} at ${company}.`;
        default:
            return `Your application status for ${jobTitle} at ${company} has been updated.`;
    }
}
userRouter.post('/updateStatusByEmployer', requireAuthEmployer, async (req, res) => {
    const { applicantId, status, note } = req.body;
    const employerId = req.user.id;
    if (!applicantId || !status) {
        return res.json({
            ok: false,
            msg: "Data required!!"
        });
    }
    const ALLOWED_STATUS = ["Shortlisted", "Rejected", "Interview_scheduled"];
    if (!ALLOWED_STATUS.includes(status)) {
        return res.json({
            ok: false,
            msg: "Invalid status value"
        });
    }
    try {
        // 🔒 Ownership check
        const applicant = await prisma.applicant.findFirst({
            where: {
                id: Number(applicantId),
                job: {
                    employerId: Number(employerId)
                }
            },
            include: {
                job: true
            }
        });
        if (!applicant) {
            return res.json({
                ok: false,
                msg: "Unauthorized action"
            });
        }
        // State update
        const ApplicantUpdate = await prisma.applicant.update({
            where: {
                id: Number(applicantId)
            },
            data: {
                status: status
            }
        });
        const User = await prisma.user.findUnique({
            where: {
                id: Number(ApplicantUpdate.userId)
            }
        });
        //  Creating Timeline 
        await prisma.applicationTimeline.create({
            data: {
                applicantId: applicantId,
                action: status,
                note: note ?? null,
                actor: 'employer',
                actorId: employerId
            }
        });
        // Creating notification to Employee
        await prisma.notificationEmployee.create({
            data: {
                userId: Number(ApplicantUpdate.userId),
                message: getNotificationMessage(status, applicant.job.title, applicant.job.company)
            }
        });
        return res.json({
            ok: true,
            msg: `Applicant ${status} successfully`,
            applicant: ApplicantUpdate
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getNotificationsUser', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "User authentication problem!!"
        });
    }
    try {
        const All = await prisma.notificationEmployee.findMany({
            where: {
                userId: Number(id)
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return res.json({
            ok: true,
            All
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.put('/markAllread', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem in authentication"
        });
    }
    try {
        await prisma.notificationEmployee.updateMany({
            where: {
                userId: Number(id),
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        return res.json({
            ok: true
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getNotiCount', requireAuth, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem in authentication"
        });
    }
    try {
        const Count = await prisma.notificationEmployee.count({
            where: {
                userId: Number(id),
                isRead: false
            }
        });
        return res.json({
            ok: true,
            count: Count
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
userRouter.get('/getShortlistedCandidates', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem with authentication"
        });
    }
    try {
        const candidates = await prisma.applicant.findMany({
            where: {
                status: 'Shortlisted',
                job: {
                    employerId: Number(id)
                }
            },
            include: {
                job: {
                    select: {
                        title: true,
                        company: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                Timeline: {
                    where: {
                        action: 'Shortlisted'
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1
                }
            },
        });
        const formattedCandidates = candidates.map(each => ({
            applicantId: each.id,
            applicantName: each.user.name,
            applicantEmail: each.user.email,
            companyName: each.job.company,
            jobTitle: each.job.title,
            shortlistedAt: each.Timeline[0]?.createdAt || null
        }));
        return res.json({
            ok: true,
            candidates: formattedCandidates
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
// Interview set karrhe hain..
userRouter.post('/setInterview', requireAuthEmployer, async (req, res) => {
    const { id } = req.user;
    if (!id) {
        return res.json({
            ok: false,
            msg: "Problem with authentication"
        });
    }
    const { applicantId, interVar, jobTitle, company } = req.body;
    if (!applicantId || !interVar.interLink || !interVar.interViewAt) {
        return res.json({
            ok: false,
            msg: "Data not found!!"
        });
    }
    const interviewAt = new Date(interVar.interViewAt);
    const date = interviewAt.toLocaleDateString('en-IN');
    const time = interviewAt.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    try {
        const Applicant = await prisma.applicant.findUnique({
            where: {
                id: Number(applicantId)
            },
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                        id: true
                    }
                }
            }
        });
        await prisma.$transaction([
            prisma.applicant.update({
                where: {
                    id: Number(applicantId)
                },
                data: {
                    status: "Interview_scheduled"
                }
            }),
            prisma.interview.create({
                data: {
                    applicantId: Number(applicantId),
                    interviewAt: interVar.interViewAt,
                    link: interVar.interLink,
                    note: interVar.note ?? null,
                    scheduledBy: Number(id)
                }
            }),
            prisma.applicationTimeline.create({
                data: {
                    applicantId: Number(applicantId),
                    actor: 'employer',
                    actorId: Number(id),
                    action: 'Interview_scheduled'
                }
            }),
            prisma.notificationEmployee.create({
                data: {
                    userId: Number(Applicant?.user.id),
                    message: `Your interview for ${jobTitle} in ${company} is scheduled on ${date} ${time}.
              An email is sent to your registered Gmail.
              `
                }
            })
        ]);
        // Sending mail
        const mailOptions = {
            from: 'bpguna11@gmail.com',
            to: Applicant?.user.email,
            subject: 'Interview scheduled',
            html: `
              <h2 style="color:#1f2937;">🎉 Interview Scheduled</h2>

              <p style="font-size:14px;color:#374151;">
                Dear <strong>${Applicant?.user.name}</strong>,
              </p>

              <p style="font-size:14px;color:#374151;">
                Your interview has been scheduled. Details are below:
              </p>

              <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;">
                <p><strong>📌 Job:</strong> ${jobTitle}</p>
                <p><strong>🏢 Company:</strong> ${company}</p>
                <p><strong>📅 Date:</strong> ${date}</p>
                <p><strong>⏰ Time:</strong> ${time}</p>
                <p>
                  <strong>🔗 Interview Link:</strong>
                  <a href="${interVar.interLink}" target="_blank">Join Interview</a>
                </p>
              </div>

              ${interVar.note
                ? `<p><strong>📝 Note:</strong><br/>${interVar.note}</p>`
                : ''}

              <p style="margin-top:20px;">
                Best of luck!<br/>
                <strong>YuvaJobs Team</strong>
              </p>
            `
        };
        await transporter.sendMail(mailOptions);
        return res.json({
            ok: true,
            msg: "Interview scheduled"
        });
    }
    catch (err) {
        console.log(err);
        return res.json({
            error: err
        });
    }
});
export default userRouter;
//# sourceMappingURL=user.js.map