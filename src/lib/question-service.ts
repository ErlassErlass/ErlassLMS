// lib/question-service.ts - service functions for question bank operations

import { prisma } from '@/lib/db';

// Get all question banks with optional filtering
export async function getQuestionBanks(limit?: number, filter?: { category?: string; difficulty?: string; isActive?: boolean }) {
  try {
    const whereClause: any = {};
    
    if (filter?.category) whereClause.category = filter.category;
    if (filter?.difficulty) whereClause.difficulty = filter.difficulty;
    if (filter?.isActive !== undefined) whereClause.isActive = filter.isActive;
    
    const questionBanks = await prisma.questionBank.findMany({
      where: whereClause,
      include: {
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: limit
    });

    return questionBanks;
  } catch (error) {
    console.error('Error fetching question banks:', error);
    throw new Error('Failed to fetch question banks');
  }
}

// Get a single question bank by ID
export async function getQuestionBank(id: string) {
  try {
    const questionBank = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        questions: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return questionBank;
  } catch (error) {
    console.error('Error fetching question bank:', error);
    throw new Error('Failed to fetch question bank');
  }
}

// Get a single question bank with its questions
export async function getQuestionBankWithQuestions(id: string) {
  try {
    const questionBank = await prisma.questionBank.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { createdAt: 'desc' }
        },
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return questionBank;
  } catch (error) {
    console.error('Error fetching question bank with questions:', error);
    throw new Error('Failed to fetch question bank with questions');
  }
}

// Create a new question bank
export async function createQuestionBank(data: {
  title: string;
  description?: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  createdById: string;
}) {
  try {
    const questionBank = await prisma.questionBank.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        isActive: data.isActive,
        createdById: data.createdById
      }
    });

    return questionBank;
  } catch (error) {
    console.error('Error creating question bank:', error);
    throw new Error('Failed to create question bank');
  }
}

// Update an existing question bank
export async function updateQuestionBank(id: string, data: {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  isActive?: boolean;
}) {
  try {
    const questionBank = await prisma.questionBank.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        category: data.category,
        difficulty: data.difficulty,
        isActive: data.isActive,
      }
    });

    return questionBank;
  } catch (error) {
    console.error('Error updating question bank:', error);
    throw new Error('Failed to update question bank');
  }
}

// Delete a question bank
export async function deleteQuestionBank(id: string) {
  try {
    await prisma.questionBank.delete({
      where: { id }
    });

    return true;
  } catch (error) {
    console.error('Error deleting question bank:', error);
    throw new Error('Failed to delete question bank');
  }
}

// Get all questions for a specific question bank
export async function getQuestionsByBankId(bankId: string) {
  try {
    const questions = await prisma.question.findMany({
      where: { questionBankId: bankId },
      orderBy: { createdAt: 'desc' }
    });

    return questions;
  } catch (error) {
    console.error('Error fetching questions by bank ID:', error);
    throw new Error('Failed to fetch questions by bank ID');
  }
}

// Get a single question by ID
export async function getQuestion(id: string) {
  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        questionBank: true
      }
    });

    return question;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw new Error('Failed to fetch question');
  }
}

// Create a new question
export async function createQuestion(data: {
  questionText: string;
  questionType: string;
  options?: any; // Using any for flexibility with JSON data
  correctAnswer: string;
  explanation?: string;
  points: number;
  questionBankId: string;
}) {
  try {
    // Process options for multiple choice questions
    let processedOptions = data.options;
    if (data.questionType === 'multiple_choice' && typeof data.options === 'object') {
      // Convert the options to JSON format for storage
      processedOptions = JSON.stringify(data.options);
    }

    const question = await prisma.question.create({
      data: {
        questionText: data.questionText,
        questionType: data.questionType,
        options: processedOptions,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points,
        questionBankId: data.questionBankId
      }
    });

    return question;
  } catch (error) {
    console.error('Error creating question:', error);
    throw new Error('Failed to create question');
  }
}

// Update an existing question
export async function updateQuestion(id: string, data: {
  questionText?: string;
  questionType?: string;
  options?: any;
  correctAnswer?: string;
  explanation?: string;
  points?: number;
}) {
  try {
    // Process options for multiple choice questions
    let processedOptions = data.options;
    if (data.questionType === 'multiple_choice' && typeof data.options === 'object') {
      // Convert the options to JSON format for storage
      processedOptions = JSON.stringify(data.options);
    }

    const question = await prisma.question.update({
      where: { id },
      data: {
        questionText: data.questionText,
        questionType: data.questionType,
        options: processedOptions,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation,
        points: data.points,
      }
    });

    return question;
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('Failed to update question');
  }
}

// Delete a question
export async function deleteQuestion(id: string) {
  try {
    await prisma.question.delete({
      where: { id }
    });

    return true;
  } catch (error) {
    console.error('Error deleting question:', error);
    throw new Error('Failed to delete question');
  }
}