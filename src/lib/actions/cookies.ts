'use server'

import { cookies } from 'next/headers'

export async function create(data) {
    cookies().set({
        name: 'tempId',
        value: data.tempId,
        path: '/',
    })
}
export async function read(data) {
    cookies().get('tempId')
}

