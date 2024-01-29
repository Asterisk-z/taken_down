import OTP from "App/Models/UserOTPs";

export default interface UserOtpRepositoryInterface {
  createOTP(userId: string): Promise<{otp: string}>
  GetOTP(userId: string): Promise<OTP | null>
}
