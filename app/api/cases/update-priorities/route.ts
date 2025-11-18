// API Route: POST /api/cases/update-priorities
// Update priorities for existing cases based on area from JSON file

import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { getAllNeedyPersons } from '@/lib/controllers/needyPerson';
import { getPriorityByArea } from '@/lib/models/needyPerson';
import { updateDocumentById } from '@/lib/db';
import NeedyPersonModel from '@/lib/models/needyPersonSchema';

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get all needy persons
    const needyPersons = await getAllNeedyPersons({ isActive: true }, {});

    let updated = 0;
    let errors = 0;

    // Update priority for each case based on area and district
    for (const person of needyPersons) {
      try {
        // Skip if _id is missing
        if (!person._id) {
          console.warn('Skipping case without _id');
          errors++;
          continue;
        }

        const correctPriority = getPriorityByArea(person.area, person.district);
        
        // Only update if priority is different
        if (person.priority !== correctPriority) {
          await updateDocumentById(NeedyPersonModel, person._id.toString(), { priority: correctPriority });
          updated++;
        }
      } catch (error) {
        console.error(`Error updating case ${person._id || 'unknown'}:`, error);
        errors++;
      }
    }

    return NextResponse.json(
      {
        message: 'Priorities updated successfully',
        updated,
        errors,
        total: needyPersons.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating priorities:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to update priorities',
      },
      { status: 500 }
    );
  }
}

