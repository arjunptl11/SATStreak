# SATStreak

SATStreak is a Duolingo-style SAT preparation app that helps students study consistently and effectively. It focuses on creating a daily habit of practice through short, personalized question sets that track progress over time. The platform is designed to make test prep engaging, accessible, and mobile-friendly.

## Overview

SATStreak provides

- Daily SAT questions tailored to a student’s current level
- A streak system that rewards consistency and builds motivation
- A mobile-first design that makes daily practice easy on any device
- Progress tracking across math, reading, and writing sections
- Study tools that explain answers and reinforce weak areas

The goal is to turn SAT preparation into a consistent and rewarding learning experience rather than a stressful last-minute effort.

## Integration with ArjunTutors

SATStreak will be released as part of ArjunTutors, a tutoring initiative dedicated to helping students improve their SAT performance through guided practice and consistency.

Through this release

- Students enrolled in ArjunTutors programs will access SATStreak as a companion app for structured daily practice
- Tutors will have access to a dashboard that tracks progress and streaks
- Data from SATStreak will integrate with ArjunTutors’ learning tools to help tutors tailor lessons to student needs

This connection makes SATStreak both a self-study resource and a teaching aid that promotes accountability and measurable progress.

## Firebase Integration (Planned)

The next phase of development involves integrating SATStreak with Firebase to handle authentication, user data, and question storage.

Planned Firebase features include

- Firebase Authentication for sign-up and login using Google or email
- Firestore Database to store questions, scores, and streak information
- Firebase Hosting for backend deployment and secure data management

A key step in this process is creating a custom SAT question database. This database will be built manually and will include

- Question text and answer options
- Correct answer keys
- Difficulty levels and categories such as algebra, geometry, and reading comprehension

Once implemented, this system will allow SATStreak to generate adaptive daily quizzes based on user performance.

## Tech Stack

- Frontend: React with Tailwind CSS
- Backend: Firebase (Firestore and Auth)
- Hosting: Firebase Hosting or Vercel
- Design: Mobile-first layout inspired by gamified learning apps

## Future Plans

- Leaderboards and friendly streak competitions
- AI-driven question recommendations
- Progress tracking for tutors through the ArjunTutors dashboard
- Support for PSAT and ACT question sets
- Expanded analytics and performance insights

## About the Creator

Arjun Patel is a high school student and founder of ArjunTutors. He built SATStreak to make SAT preparation more effective and enjoyable for students. Arjun’s goal is to combine computer science, design, and education to create tools that help students stay consistent and confident in their learning.

## Setup Instructions

If you want to run or contribute to SATStreak locally

```bash
# Clone this repository
git clone https://github.com/arjunptl11/SATStreak.git

# Navigate into the project
cd SATStreak

# Install dependencies
npm install

# Start the development server
npm start
