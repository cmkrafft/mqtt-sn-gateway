export class TopicService {

    private topicMappings: string[];

    constructor() {
        this.topicMappings = [];
    }

    public getTopicIdByTopic(topic: string): number | undefined {
        const index: number = this.topicMappings.indexOf(topic);

        return index !== -1
            ? index
            : undefined;
    }

    public getTopicByTopicId(topicId: number): string | undefined {
        return this.topicMappings[topicId.toString()];
    }

    public addTopic(topic: string): number {
        let topicId: number = this.getTopicIdByTopic(topic);

        if (topicId !== undefined) {
            return topicId;
        }

        topicId = this.getNextFreeTopicId();

        // TODO: Should be topicId?!
        this.topicMappings[this.getNextFreeTopicId()] = topic;

        return topicId;
    }

    public removeTopic(topic: string): void {
        this.topicMappings[this.topicMappings.indexOf(topic)] = undefined;
    }

    private getNextFreeTopicId(): number {
        const topicId = this.topicMappings.indexOf(undefined);

        return topicId !== -1
            ? topicId
            : this.topicMappings.length;
    }

}
