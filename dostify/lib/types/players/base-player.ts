export abstract class BasePlayer {
    public abstract Play(): Promise<void>;
    public abstract Pause(): Promise<void>;
    public abstract IsPlaying(): Promise<boolean>;
    public abstract GetVolumePercent(): Promise<number>
    public abstract SetVolumePercent(percent: number): Promise<void>
}