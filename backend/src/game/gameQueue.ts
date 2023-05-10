export class GameQueue {
	private capacity: number;
	private count: number;
	private front: number;
	private rear: number;
	private queue: string[];

	constructor(size: number) {
		this.capacity = size;
		this.count = 0;
		this.front = 0;
		this.rear = 0;
		this.queue = [];
	}

	private isFull(): boolean {
		return this.capacity === this.count;
	}

	public enQueue(data: string): boolean {
		if (this.isFull())
			return false;
		this.queue[this.rear] = data;
		this.rear = (this.rear + 1) % this.capacity;
		this.count++;
		return true;
	}

	public deQueue(): string {
		const returnData = this.queue[this.front];
		this.front = (this.front + 1) % this.capacity;
		this.count--;
		return returnData;
	}

	public deQueueSecond(): void {
		this.queue[(this.front + 1) % this.capacity] = this.queue[this.front];
		this.front = (this.front + 1) % this.capacity;
		this.count--;
	}

	public peek(flag: number): string {
		if (flag === 1)
			return this.queue[this.front];
		return this.queue[(this.front + 1) % this.capacity];
	}

	public getCount(): number {
		return this.count;
	}
}