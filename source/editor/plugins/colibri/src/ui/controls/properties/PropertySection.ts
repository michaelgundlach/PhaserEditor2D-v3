/// <reference path="./FormBuilder.ts" />
namespace colibri.ui.controls.properties {

    export declare type Updater = () => void;

    export abstract class PropertySection<T> extends FormBuilder {

        private _id: string;
        private _title: string;
        private _page: PropertyPage;
        private _updaters: Updater[];
        private _fillSpace: boolean;
        private _collapsedByDefault: boolean;
        private _tabSection: string;

        constructor(page: PropertyPage, id: string, title: string, fillSpace = false, collapsedByDefault = false, tabSectionByDefault?: string) {
            super();

            this._page = page;
            this._id = id;
            this._title = title;
            this._fillSpace = fillSpace;
            this._collapsedByDefault = collapsedByDefault;
            this._updaters = [];

            const localTabSection = localStorage.getItem(this.localStorageKey("tabSection"));

            if (localTabSection) {

                if (localTabSection !== "undefined") {

                    this._tabSection = localTabSection;
                }

            } else {

                this._tabSection = tabSectionByDefault;
            }
        }

        abstract createForm(parent: HTMLDivElement);

        abstract canEdit(obj: any, n: number): boolean;

        canShowInTabSection(tabSection: string) {

            return this._tabSection === tabSection;
        }

        private setTabSection(tabSection: string) {

            this._tabSection = tabSection;

            localStorage.setItem(this.localStorageKey("tabSection"), tabSection || "undefined");
        }

        private localStorageKey(prop: string) {

            return "PropertySection[" + this._id + "]." + prop;
        }

        protected createTabSectionMenuItem(menu: controls.Menu, tabSection: string) {

            menu.addAction({
                text: "Show In " + tabSection,
                selected: this._tabSection === tabSection,
                callback: () => {

                    this.setTabSection(this._tabSection === tabSection ? undefined : tabSection);

                    this.getPage().updateWithSelection();
                }
            });
        }


        abstract canEditNumber(n: number): boolean;

        createMenu(menu: controls.Menu) {
            // empty by default
        }

        hasMenu() {

            return false;
        }

        updateWithSelection(): void {

            for (const updater of this._updaters) {

                updater();
            }
        }

        addUpdater(updater: Updater) {
            this._updaters.push(updater);
        }

        isFillSpace() {
            return this._fillSpace;
        }

        isCollapsedByDefault() {

            return this._collapsedByDefault;
        }

        getPage() {
            return this._page;
        }

        getSelection(): T[] {

            return this._page.getSelection();
        }

        getSelectionFirstElement(): T {

            return this.getSelection()[0];
        }

        getId() {
            return this._id;
        }

        getTitle() {
            return this._title;
        }

        create(parent: HTMLDivElement): void {
            this.createForm(parent);
        }

        flatValues_Number(values: number[]): string {

            const set = new Set(values);

            if (set.size === 1) {

                const value = set.values().next().value;

                return value.toString();
            }

            return "";
        }

        flatValues_StringJoin(values: string[]): string {
            return values.join(",");
        }

        flatValues_StringJoinDifferent(values: string[]): string {

            const set = new Set(values);

            return [...set].join(",");
        }

        flatValues_StringOneOrNothing(values: string[]): string {

            const set = new Set(values);

            return set.size === 1 ? values[0] : `(${values.length} selected)`;
        }

        flatValues_BooleanAnd(values: boolean[]) {

            for (const value of values) {

                if (!value) {

                    return false;
                }
            }

            return true;
        }

        parseNumberExpression(textElement: HTMLInputElement, isInteger = false) {

            const expr = textElement.value;

            let value: number;

            const parser = new exprEval.Parser();

            try {

                value = parser.evaluate(expr);

                if (typeof value === "number") {

                    textElement.value = value.toString();


                    if (isInteger) {

                        return Math.floor(value);
                    }

                    return value;
                }

            } catch (e) {

                // nothing, wrong syntax
            }

            if (isInteger) {

                return Number.parseInt(expr, 10);
            }

            return Number.parseFloat(expr);
        }

        createGridElement(parent: HTMLElement, cols = 0, simpleProps = true) {

            const div = document.createElement("div");

            div.classList.add("formGrid");

            if (cols > 0) {
                div.classList.add("formGrid-cols-" + cols);
            }

            if (simpleProps) {
                div.classList.add("formSimpleProps");
            }

            parent.appendChild(div);

            return div;
        }

        
    }
}