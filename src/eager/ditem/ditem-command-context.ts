import { CommandContext } from '@plxtra/motif-core';

export interface DitemCommandContext extends CommandContext {
    readonly dataIvemIdLinkable: boolean;
    dataIvemIdLinked: boolean;
    readonly brokerageAccountGroupLinkable: boolean;
    brokerageAccountGroupLinked: boolean;
}
