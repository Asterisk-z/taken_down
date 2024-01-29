import OTP from "App/Models/UserOTPs";
import UserOtpRepositoryInterface from "App/Repositories/Interfaces/UserOtpRepsitoryInterface";

export default class UserOtpRepository implements UserOtpRepositoryInterface {
  async createOTP(userId: string): Promise<{ otp: string }> {
    const otp = `${Math.floor(Math.random() * 900000) + 100000}`;
    const expiresAt = Date.now() + 600000;

    await OTP.updateOrCreate({ userId }, { userId, otp, expiresAt });

    return { otp };
  }
  async GetOTP(userId: string): Promise<OTP | null> {
    return OTP.query().where("userId", userId).first();
  }

  async DeleteUserOTP(userId: string): Promise<void> {
    await OTP.query().where("userId", userId).delete();
    return;
  }

}
