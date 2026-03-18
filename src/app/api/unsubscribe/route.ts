import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/unsubscribe — confirm unsubscribe by token
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'رمز غير صحيح' }, { status: 400 })
    }

    const subscriber = await prisma.subscriber.findUnique({
      where: { unsubscribeToken: token },
    })

    if (!subscriber) {
      return NextResponse.json({ error: 'الرمز غير صالح أو انتهت صلاحيته' }, { status: 404 })
    }

    await prisma.subscriber.delete({ where: { id: subscriber.id } })

    return NextResponse.json({ message: 'تم إلغاء اشتراكك بنجاح' })
  } catch {
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
