import { Body, Controller, Post } from '@nestjs/common';
import { HistoryService } from './history.service';
import { GameResultDto } from './dto/gameResult.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("History")
@Controller('history')
export class HistoryController {
	constructor(private historyService: HistoryService) {}

	@ApiOperation({
		summary: 'Update member ping game information',
		description: 'It updates the game result information of two game players. \
			In the case of the winner, The win column is incremented by 1 and the score column is incremented by 5. \
			The level column is the quotient obtained by dividing the score column by 10. \
			The winner will earn achievements according to the game score and the total number of wins. \
			On the contrary, in the case of the loser, The lose column is incremented by 1 and the score column is decremented by 3. \
			If the score is less than zero, it is initialized to zero. \
			The level column is the quotient obtained by dividing the score column by 10. \
			Lastly, the status of both players is updated from \'ingame\' to \'online\'.'
	})
	@Post()
	async updateGameResultAndHistory(@Body() gameResult: GameResultDto): Promise<void> {
		await this.historyService.updateGameResult(gameResult);
	}
}
