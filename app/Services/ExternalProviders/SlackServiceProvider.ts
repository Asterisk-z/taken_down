import Env from '@ioc:Adonis/Core/Env'
import { App } from '@slack/bolt'

export class SlackServiceProvider {
  private static SLACK_SIGNIN_SECRET: string = Env.get('SLACK_SIGNIN_SECRET')
  private static SLACK_BOT_TOKEN: string = Env.get('SLACK_BOT_TOKEN')
  private static SLACK_CHANNEL: string = Env.get('SLACK_CHANNEL')
  private static app = new App({
    signingSecret: this.SLACK_SIGNIN_SECRET,
    token: this.SLACK_BOT_TOKEN,
  })

  public static async sendMessageToChannel(message: string) {
    try {
      const blocks = [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: message,
          },
        },
        {
          type: 'divider',
        },
      ]
      const postMessage = await this.app.client.chat.postMessage({
        token: this.SLACK_BOT_TOKEN,
        channel: this.SLACK_CHANNEL,
        blocks,
      })
      return postMessage
    } catch (error) {
      throw error
    }
  }
}
