class GameQueue {
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

	private isEmpty(): boolean {
		return this.front === this.rear;
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
		if (this.isEmpty())
			return null;
		const returnData = this.queue[this.front];
		this.front = (this.front + 1) % this.capacity;
		this.count--;
		return returnData;
	}

	public getCount(): number {
		return this.count;
	}
}