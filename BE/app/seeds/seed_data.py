import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import (
    User, UserRole, Question, ExamType, SkillType,
    Submission, SubmissionStatus, Assessment, TeacherReview, Notification
)
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

def seed_database(db: Session):
    # Check if database is already seeded
    if db.query(User).first():
        logger.info("Database already seeded. Skipping initial seeding.")
        return

    logger.info("Seeding database with initial users, questions, attempts, and reviews...")

    # 1. Seed Users
    default_password = get_password_hash("123456")
    learner = User(
        email="learner@lingoprep.com",
        hashed_password=default_password,
        full_name="Alex Nguyen",
        role=UserRole.LEARNER,
        target_exam="IELTS",
        target_score="7.5",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    teacher = User(
        email="teacher@lingoprep.com",
        hashed_password=default_password,
        full_name="Sarah Jenkins (IELTS Examiner)",
        role=UserRole.TEACHER,
        target_exam="IELTS",
        target_score="9.0",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    )
    admin = User(
        email="admin@lingoprep.com",
        hashed_password=default_password,
        full_name="System Administrator",
        role=UserRole.ADMIN,
        target_exam="IELTS",
        target_score="9.0",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    )
    db.add_all([learner, teacher, admin])
    db.commit()
    db.refresh(learner)
    db.refresh(teacher)
    db.refresh(admin)

    # 2. Seed Questions Bank
    questions_data = [
        # IELTS Speaking Part 1
        Question(
            exam_type=ExamType.IELTS,
            skill=SkillType.SPEAKING,
            part="Part 1",
            title="Work & Studies",
            topic="Daily Life",
            difficulty="Easy",
            prompt="Do you work or are you a student? What do you enjoy most about your current studies or career, and would you consider changing it in the future?",
            instructions="Give direct answers followed by 1 or 2 supporting sentences with specific reasons or personal examples.",
            prep_time_seconds=15,
            time_limit_seconds=60,
            tags=["Part 1", "Introduction", "Daily Life"]
        ),
        # IELTS Speaking Part 2
        Question(
            exam_type=ExamType.IELTS,
            skill=SkillType.SPEAKING,
            part="Part 2",
            title="Describe an Influential Mentor",
            topic="People & Society",
            difficulty="Medium",
            prompt=(
                "Describe a person who has had a significant positive influence on your life.\n"
                "You should say:\n"
                "- Who this person is\n"
                "- How you first met them\n"
                "- What qualities or skills you learned from them\n"
                "And explain why their guidance was so important to you."
            ),
            instructions="You have 1 minute to prepare notes. Speak continuously for between 1 and 2 minutes.",
            prep_time_seconds=60,
            time_limit_seconds=120,
            tags=["Part 2", "Cue Card", "People", "Long Turn"]
        ),
        # IELTS Speaking Part 3
        Question(
            exam_type=ExamType.IELTS,
            skill=SkillType.SPEAKING,
            part="Part 3",
            title="Artificial Intelligence & Future Careers",
            topic="Technology & Future",
            difficulty="Hard",
            prompt="To what extent do you think artificial intelligence will transform the nature of human work over the next two decades? Will interpersonal skills become more or less valuable?",
            instructions="Provide an extended abstract answer exploring multiple perspectives and future implications.",
            prep_time_seconds=20,
            time_limit_seconds=90,
            tags=["Part 3", "Discussion", "Technology", "Abstract"]
        ),
        # IELTS Writing Task 1
        Question(
            exam_type=ExamType.IELTS,
            skill=SkillType.WRITING,
            part="Task 1",
            title="Global Internet Adoption (2010-2024)",
            topic="Technology & Data",
            difficulty="Medium",
            prompt=(
                "The line graph shows the proportion of households with high-speed broadband internet access in five developed economies "
                "(UK, USA, South Korea, Germany, Japan) between 2010 and 2024.\n\n"
                "Summarize the information by selecting and reporting the main features, and make comparisons where relevant."
            ),
            instructions="Write at least 150 words. Do not give your personal opinion; report facts and trends objectively.",
            prep_time_seconds=0,
            time_limit_seconds=1200, # 20 mins
            min_words=150,
            max_words=220,
            image_url="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
            tags=["Task 1", "Academic", "Data Analysis", "Trends"]
        ),
        # IELTS Writing Task 2
        Question(
            exam_type=ExamType.IELTS,
            skill=SkillType.WRITING,
            part="Task 2",
            title="Free University Education vs Student Tuition",
            topic="Education & Society",
            difficulty="Hard",
            prompt=(
                "Some people believe that higher education should be funded entirely by the state and free for all citizens, "
                "while others argue that university students should bear the financial cost themselves since they benefit directly.\n\n"
                "Discuss both views and give your own opinion."
            ),
            instructions="Write at least 250 words. Present a well-developed argument supported by relevant examples from your knowledge or experience.",
            prep_time_seconds=0,
            time_limit_seconds=2400, # 40 mins
            min_words=250,
            max_words=380,
            tags=["Task 2", "Opinion Essay", "Higher Education", "Social Policy"]
        ),
        # Aptis Speaking Part 1
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.SPEAKING,
            part="Part 1",
            title="Personal Preferences & Hobbies",
            topic="Lifestyle",
            difficulty="Easy",
            prompt="Please tell me about your favourite way to relax after a busy day. What activities make you feel calm and refreshed?",
            instructions="Answer in 30 seconds. Speak clearly at a natural pace.",
            prep_time_seconds=5,
            time_limit_seconds=30,
            tags=["Aptis", "Speaking Part 1", "Personal Info"]
        ),
        # Aptis Speaking Part 2
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.SPEAKING,
            part="Part 2",
            title="Describe an Office Workspace",
            topic="Work Environment",
            difficulty="Medium",
            prompt="Describe what you see in the photograph. What are the people doing, and what kind of working atmosphere does this image convey?",
            instructions="You have 45 seconds to describe the picture in detail.",
            prep_time_seconds=10,
            time_limit_seconds=45,
            image_url="https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800",
            tags=["Aptis", "Speaking Part 2", "Picture Description"]
        ),
        # Aptis Speaking Part 3
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.SPEAKING,
            part="Part 3",
            title="Compare Traditional Classroom vs Remote Learning",
            topic="Education Methods",
            difficulty="Medium",
            prompt="Compare these two approaches to education. What are the distinct benefits and drawbacks of studying in a physical classroom versus studying independently online?",
            instructions="Speak for 45 seconds comparing both photographs and giving reasoned preferences.",
            prep_time_seconds=10,
            time_limit_seconds=45,
            image_url="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
            tags=["Aptis", "Speaking Part 3", "Comparison"]
        ),
        # Aptis Speaking Part 4
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.SPEAKING,
            part="Part 4",
            title="Work-Life Balance in Modern Society",
            topic="Societal Trends",
            difficulty="Hard",
            prompt="Tell me about a time when you felt overwhelmed with responsibilities. How did you regain balance, and why is leisure time essential for long-term health?",
            instructions="You have 1 minute to prepare and 2 minutes to address all three aspects.",
            prep_time_seconds=60,
            time_limit_seconds=120,
            tags=["Aptis", "Speaking Part 4", "Personal Narrative"]
        ),
        # Aptis Writing Part 2
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.WRITING,
            part="Part 2",
            title="Sports Club Registration Form",
            topic="Sports & Health",
            difficulty="Easy",
            prompt="You are joining an International Outdoor Activities Club. Fill in the form explaining your reasons for joining and your preferred outdoor activities.",
            instructions="Write 20 to 30 words in full sentences.",
            prep_time_seconds=0,
            time_limit_seconds=420, # 7 mins
            min_words=20,
            max_words=35,
            tags=["Aptis", "Writing Part 2", "Form Completion"]
        ),
        # Aptis Writing Part 4
        Question(
            exam_type=ExamType.APTIS,
            skill=SkillType.WRITING,
            part="Part 4",
            title="Weekend Hiking Trip Rescheduling",
            topic="Club Activities",
            difficulty="Medium",
            prompt=(
                "You are a member of a local hiking club. You just received an email stating that the upcoming annual mountain excursion "
                "has been postponed by two weeks and the venue changed without prior consultation.\n\n"
                "1. Write an informal email to your friend (approx. 50 words) sharing your thoughts and feelings about the announcement.\n"
                "2. Write a formal email to the club president (120-150 words) expressing your disappointment, explaining how this affects your plans, and proposing a compromise."
            ),
            instructions="Maintain distinct formal and informal registers. Keep within the recommended word counts.",
            prep_time_seconds=0,
            time_limit_seconds=1500, # 25 mins
            min_words=170,
            max_words=220,
            tags=["Aptis", "Writing Part 4", "Email Communication", "Register Shift"]
        )
    ]
    db.add_all(questions_data)
    db.commit()

    for q in questions_data:
        db.refresh(q)

    # 3. Seed Sample Attempt 1: IELTS Writing Task 2 (Evaluated)
    q_writing = questions_data[4] # University tuition
    sub1 = Submission(
        user_id=learner.id,
        question_id=q_writing.id,
        submission_type=SkillType.WRITING,
        content_text=(
            "The question of whether tertiary education should be provided free of charge by national governments "
            "or funded directly by attending students is a matter of ongoing debate. While some maintain that public "
            "funding ensures equality of opportunity, others contend that personal investment leads to higher academic commitment. "
            "In my view, a hybrid model offering targeted state subsidies alongside manageable personal contributions represents the most pragmatic solution.\n\n"
            "On the one hand, advocates of free university tuition emphasize the principle of social mobility. "
            "When academic admission is based solely on merit rather than financial capability, talented individuals from "
            "disadvantaged backgrounds can pursue professional qualifications. Consequently, society benefits from a highly skilled "
            "workforce in vital sectors such as healthcare, engineering, and education. For instance, countries in Scandinavia "
            "that subsidize higher education consistently demonstrate low income inequality and robust economic dynamism.\n\n"
            "On the other hand, proponents of tuition fees argue that tertiary education yields substantial private returns. "
            "Graduates typically earn significantly higher lifetime incomes compared to non-graduates; therefore, it is arguably equitable "
            "for them to shoulder a portion of educational costs rather than burdening general taxpayers who may never attend university. "
            "Furthermore, financial participation often encourages students to make more judicious choices regarding their academic programs.\n\n"
            "In conclusion, while total state funding fosters inclusivity, complete privatization risks exacerbating societal division. "
            "A balanced system incorporating income-contingent loans and merit-based grants ensures both accessibility and fiscal sustainability."
        ),
        word_count=264,
        duration_seconds=1850,
        status=SubmissionStatus.EVALUATED,
        created_at=datetime.utcnow() - timedelta(days=2)
    )
    db.add(sub1)
    db.commit()
    db.refresh(sub1)

    ass1 = Assessment(
        submission_id=sub1.id,
        overall_band=7.5,
        overall_cefr="C1",
        task_response_score=7.5,
        coherence_score=8.0,
        lexical_score=7.5,
        grammar_score=7.0,
        criteria_breakdown={
            "task_response": {"score": 7.5, "feedback": "Thoroughly addresses both views with a clear, nuanced personal stance."},
            "coherence": {"score": 8.0, "feedback": "Well-organized progression with cohesive linkers: 'On the one hand', 'Consequently'."},
            "lexical": {"score": 7.5, "feedback": "Effective use of academic collocations: 'pragmatic solution', 'social mobility'."},
            "grammar": {"score": 7.0, "feedback": "Accurate complex sentence structures, clean modal and conditional usage."}
        },
        strengths=[
            "Clear thesis statement presented in the introduction and reinforced in the conclusion.",
            "Sophisticated topic-specific vocabulary ('fiscal sustainability', 'income-contingent').",
            "Logical paragraph structure with seamless transition markers."
        ],
        weaknesses=[
            "Could integrate one more concrete statistical example in paragraph 2 to fortify the argument.",
            "Minor punctuation slip with semicolons in compound sentence clauses."
        ],
        inline_feedback=[
            {
                "original": "tertiary education should be provided free of charge",
                "improved": "tertiary education ought to be subsidized universally",
                "explanation": "Advanced modal phrase adds stylistic elegance.",
                "category": "Lexical Sophistication"
            },
            {
                "original": "On the other hand, proponents of tuition fees argue...",
                "improved": "Conversely, defenders of personal tuition argue...",
                "explanation": "Elevated transition marker ('Conversely') creates strong contrast.",
                "category": "Coherence"
            }
        ],
        model_answer=(
            "A comprehensive Band 8.5 essay achieves distinction through effortless precision in academic style "
            "and impeccably balanced dialectical argument."
        ),
        recommendations=[
            "Continue writing timed essays (40 minutes) to maintain your natural structural flow.",
            "Incorporate concessive clauses ('Notwithstanding the aforementioned merits...') to further deepen evaluation."
        ]
    )
    db.add(ass1)

    # 4. Seed Sample Attempt 2: IELTS Speaking Part 2 (Review Requested for Teacher Queue)
    q_speaking = questions_data[1] # Influential Mentor
    sub2 = Submission(
        user_id=learner.id,
        question_id=q_speaking.id,
        submission_type=SkillType.SPEAKING,
        content_text=(
            "I would like to talk about my former high school teacher, Mr. Robert, who played an instrumental role in shaping my career path. "
            "I first met him during my junior year when I was struggling significantly with advanced mathematics and lacked self-confidence. "
            "Rather than merely assigning routine homework, he patiently demonstrated how theoretical concepts translated into real-world applications. "
            "What impressed me most was his unwavering patience and genuine passion for mentorship. Under his encouragement, "
            "I not only overcame my academic anxiety but also developed a profound enthusiasm for analytical problem solving. "
            "Even today, whenever I encounter complex challenges in my work, I still reflect on his advice to break down daunting problems into manageable steps."
        ),
        word_count=118,
        duration_seconds=78,
        status=SubmissionStatus.REVIEW_REQUESTED,
        created_at=datetime.utcnow() - timedelta(hours=18)
    )
    db.add(sub2)
    db.commit()
    db.refresh(sub2)

    ass2 = Assessment(
        submission_id=sub2.id,
        overall_band=7.0,
        overall_cefr="C1",
        fluency_score=7.0,
        lexical_score=7.5,
        grammar_score=7.0,
        pronunciation_score=6.5,
        criteria_breakdown={
            "fluency": {"score": 7.0, "feedback": "Spoke at a fluid tempo without noticeable unnatural hesitation."},
            "lexical": {"score": 7.5, "feedback": "Impressive collocations ('instrumental role', 'unwavering patience')."},
            "grammar": {"score": 7.0, "feedback": "Consistent narrative past tenses and successful relative clause attachments."},
            "pronunciation": {"score": 6.5, "feedback": "Clear articulation; sentence rhythm could be slightly more dynamic on emotive points."}
        },
        strengths=[
            "Engaging personal narrative addressing all cue card bullet points seamlessly.",
            "Strong idiomatic command and precise emotional descriptors.",
            "Confident pacing with natural breathing pauses."
        ],
        weaknesses=[
            "Word stress on 'analytical' and 'instrumental' could be sharper.",
            "Slight drop in vocal projection toward the conclusion."
        ],
        inline_feedback=[
            {
                "original": "struggling significantly with advanced mathematics",
                "improved": "grappling with demanding mathematical concepts",
                "explanation": "'Grappling with' provides a vivid idiomatic image of effort.",
                "category": "Lexical Variety"
            }
        ],
        model_answer="An authentic Band 8.5 speaking response utilizes varied tonal intonation and spontaneous idiomatic flair.",
        recommendations=[
            "Practice recording with exaggerated pitch variations to enrich vocal musicality.",
            "Practice answering unexpected examiner follow-up questions in 1-2 concise sentences."
        ]
    )
    db.add(ass2)

    # 5. Seed Teacher Review for Attempt 1
    review1 = TeacherReview(
        submission_id=sub1.id,
        teacher_id=teacher.id,
        overall_band=7.5,
        overall_cefr="C1",
        criteria_scores={
            "task_response": 7.5,
            "coherence": 8.0,
            "lexical": 7.5,
            "grammar": 7.0
        },
        teacher_notes=(
            "Outstanding writing piece, Alex! Your paragraph structure is exceptionally clean and easy to follow. "
            "The Nordic country example provides strong empirical weight to your first body paragraph. "
            "Keep an eye on semicolon usage in complex lines, but overall this is a textbook Band 7.5+ performance."
        ),
        is_overridden=False
    )
    db.add(review1)

    # 6. Seed In-app Notifications
    notif1 = Notification(
        user_id=learner.id,
        title="AI Evaluation Completed",
        message="Your IELTS Writing Task 2 essay 'Free University Education' scored Band 7.5 (CEFR C1).",
        type="EVALUATION_COMPLETED",
        link="/assessment/" + str(sub1.id),
        is_read=True
    )
    notif2 = Notification(
        user_id=learner.id,
        title="Teacher Review Available",
        message="Examiner Sarah Jenkins reviewed your essay and left personalized feedback.",
        type="TEACHER_REVIEWED",
        link="/assessment/" + str(sub1.id),
        is_read=False
    )
    db.add_all([notif1, notif2])
    db.commit()

    logger.info("Database seeding completed successfully!")
