import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Env from '@ioc:Adonis/Core/Env'
import { USERTYPE } from 'App/Shared/Enums/UserEnum'

export default class extends BaseSeeder {
  public async run() {
    // Write your database queries inside the run method
    await User.create({
      email: Env.get('ADMIN_EMAIL'),
      password: Env.get('ADMIN_PASSWORD'),
      firstName: 'Anonance',
      lastName: 'Admin',
      isTermsAndConditionsAccepted: true,
      isVerified: true,
      isPhoneNumberVerified: true,
      type: USERTYPE.ADMIN,
      isFirstLogin: false,
      isRegistrationCompleted: true,
    })
  }
}
