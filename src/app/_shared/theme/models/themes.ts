import * as PARCEL_ICONS from '@assets/icons/parcel/icons.json';
import * as LINDE_ICONS from '@assets/icons/linde/icons.json';
import * as STILL_ICONS from '@assets/icons/still/icons.json';
import * as KION_ICONS from '@assets/icons/kion/icons.json';
import * as BAOLI_ICONS from '@assets/icons/baoli/icons.json';

export interface Theme {
    name: string;
    iconSet: any[];
    cssClassName: string;
    properties: any;
}

export const parcelIcons: any[] = (PARCEL_ICONS as any).default;

const themeKion: Theme = {
    name: 'Kion',
    iconSet: (KION_ICONS as any).default,
    cssClassName: 'theme-KION',
    properties: {
        /* base colors */
        '--brand-700': '#ae0055',
        '--brand-500': '#fcb900',

        '--gray-900': '#222222',
        '--gray-700': '#444444',
        '--gray-600': '#6A6B6E',
        '--gray-400': '#9B9B9E',
        '--gray-300': '#CCCDD1',
        '--gray-100': '#EEEFF3',
        '--gray-50': '#F4F5F7',
        '--white': '#FFFFFF',
        '--black': '#000000',

        '--success': '#35CD05',
        '--warning': '#FFAD00',
        '--background-warning-alert': '#FFEFCC',
        '--danger': '#FF0000',
        '--background-danger-alert': '#FFCCCC',
        '--promotion': '#55E9F4',

        /* background colors */
        '--background-primary': '#FFFFFF',
        '--background-secondary': '#F4F5F7',
        '--background-tertiary': '#EEEFF3',
        '--background-quarternary': '#94001D',
        '--background-modal': 'rgba(0,0,0,0.7)',
        '--background-danger': '#FFCCCC',
        '--background-warning': '#FFEFFC',

        /* button colors */
        '--button-primary': '#ae0055',
        '--button-hover': '#94991D',
        '--button-secondary': '#EEEFF3',
        '--button-disabled': '#EEEFF4',

        /* border colors */
        '--button-primary-border': '#ae0055',
        '--button-primary-hover-border': '#ae0055',
        '--button-dark-gray-border': '#444444',
        '--button-gray-border': '#9B9B9E',
        '--button-light-gray-border': '#CCCdd1',

        /* text colors */
        '--text-900': '#222222',
        '--text-700': '#444444',
        '--text-600': '#6A6B6E',
        '--text-400': '#9B9B9E',
        '--text-300': '#CCCDD1',
        '--text-white': '#FFFFFF',
        '--text-brand-500': '#ae0055',
        '--text-danger': '#ff0000',
        '--text-success': '#36cd05',

        /* toast colors */
        '--toast-error': '#FF0000',
        '--toast-success': '#35CD05',
        '--toast-warning': '#FFAD00',

        /* promotion colors */
        '--promotion-info': '#55E9F4',

        /* font weight */
        '--font-weight-regular': '400',
        '--font-weight-bold': '700',

        /* font sizes */
        '--title-font-size-xxl': '54px',
        '--title-font-size-xl': '46px',
        '--title-font-size-l': '40px',
        '--title-font-size-m': '32px',
        '--title-font-size-s': '24px',
        '--title-font-size-xs': '20px',
        '--body-font-size-l': '18px',
        '--body-font-size-m': '16px',
        '--body-font-size-s': '14px',
        '--body-font-size-xs': '12px',
        '--body-font-size-xxs': '10px',

        '--title-line-height-xxl': '130%',
        '--title-line-height-xl': '150%',
        '--title-line-height-l': '150%',
        '--title-line-height-m': '150%',
        '--title-line-height-s': '150%',
        '--title-line-height-xs': '150%',
        '--body-line-height-l': '150%',
        '--body-line-height-m': '150%',
        '--body-line-height-s': '150%',
        '--body-line-height-xs': '125%',
        '--body-line-height-xxs': '125%',

        /* spaces (same for Linde and Still) */
        '--no-space': '0px',
        '--s-space-xxxs': '4px',
        '--s-space-xxs': '8px',
        '--s-space-xs': '12px',
        '--s-space-s': '16px',
        '--s-space-m': '24px',
        '--s-space-l': '32px',
        '--s-space-xl': '40px',
        '--l-space-s': '48px',
        '--l-space-m': '64px',
        '--l-space-l': '80px',
        '--l-space-xl': '100px',

        /* box-shadows */
        '--small-shadow': '0px 2px 6px 0px rgba(0,0,0,0.1)',
        '--regular-shadow': '1px 6px 15px 0px rgba(0,0,0,0.25)',
        '--large-shadow': '1px 10px 19px 0px rgba(0,0,0,0.25)',

        /* borders */
        '--border-radius-primary': '0px',
        '--border-radius-secondary': '0px',

        '--border-width-primary': '1px solid',
        '--border-width-secondary': '2px solid',

        '--font-family': 'Arial',
    },
};

const themeLinde: Theme = {
    name: 'Linde',
    iconSet: (LINDE_ICONS as any).default,
    cssClassName: 'theme-LMH',
    properties: {
        /* base colors */
        '--brand-700': '#94001D',
        '--brand-500': '#fcb900',

        '--gray-900': '#222222',
        '--gray-700': '#444444',
        '--gray-600': '#6A6B6E',
        '--gray-400': '#9B9B9E',
        '--gray-300': '#CCCDD1',
        '--gray-100': '#EEEFF3',
        '--gray-50': '#F4F5F7',
        '--white': '#FFFFFF',
        '--black': '#000000',

        '--success': '#35CD05',
        '--warning': '#FFAD00',
        '--background-warning-alert': '#FFEFCC',
        '--danger': '#FF0000',
        '--background-danger-alert': '#FFCCCC',
        '--promotion': '#55E9F4',

        /* background colors */
        '--background-primary': '#FFFFFF',
        '--background-secondary': '#F4F5F7',
        '--background-tertiary': '#EEEFF3',
        '--background-quarternary': '#94001D',
        '--background-modal': 'rgba(0,0,0,0.7)',
        '--background-danger': '#FFCCCC',
        '--background-warning': '#FFEFFC',

        /* button colors */
        '--button-primary': '#AA0020',
        '--button-hover': '#94991D',
        '--button-secondary': '#EEEFF3',
        '--button-disabled': '#EEEFF4',

        /* border colors */
        '--button-primary-border': '#AA0020',
        '--button-primary-hover-border': '#94001D',
        '--button-dark-gray-border': '#444444',
        '--button-gray-border': '#9B9B9E',
        '--button-light-gray-border': '#CCCdd1',

        /* text colors */
        '--text-900': '#222222',
        '--text-700': '#444444',
        '--text-600': '#6A6B6E',
        '--text-400': '#9B9B9E',
        '--text-300': '#CCCDD1',
        '--text-white': '#FFFFFF',
        '--text-brand-500': '#aa0020',
        '--text-danger': '#ff0000',
        '--text-success': '#36cd05',

        /* toast colors */
        '--toast-error': '#FF0000',
        '--toast-success': '#35CD05',
        '--toast-warning': '#FFAD00',

        /* promotion colors */
        '--promotion-info': '#55E9F4',

        /* font weight */
        '--font-weight-regular': '400',
        '--font-weight-bold': '700',

        /* font sizes */
        '--title-font-size-xxl': '54px',
        '--title-font-size-xl': '46px',
        '--title-font-size-l': '40px',
        '--title-font-size-m': '32px',
        '--title-font-size-s': '24px',
        '--title-font-size-xs': '20px',
        '--body-font-size-l': '18px',
        '--body-font-size-m': '16px',
        '--body-font-size-s': '14px',
        '--body-font-size-xs': '12px',
        '--body-font-size-xxs': '10px',

        '--title-line-height-xxl': '130%',
        '--title-line-height-xl': '150%',
        '--title-line-height-l': '150%',
        '--title-line-height-m': '150%',
        '--title-line-height-s': '150%',
        '--title-line-height-xs': '150%',
        '--body-line-height-l': '150%',
        '--body-line-height-m': '150%',
        '--body-line-height-s': '150%',
        '--body-line-height-xs': '125%',
        '--body-line-height-xxs': '125%',

        /* spaces (same for Linde and Still) */
        '--no-space': '0px',
        '--s-space-xxxs': '4px',
        '--s-space-xxs': '8px',
        '--s-space-xs': '12px',
        '--s-space-s': '16px',
        '--s-space-m': '24px',
        '--s-space-l': '32px',
        '--s-space-xl': '40px',
        '--l-space-s': '48px',
        '--l-space-m': '64px',
        '--l-space-l': '80px',
        '--l-space-xl': '100px',

        /* box-shadows */
        '--small-shadow': '0px 2px 6px 0px rgba(0,0,0,0.1)',
        '--regular-shadow': '1px 6px 15px 0px rgba(0,0,0,0.25)',
        '--large-shadow': '1px 10px 19px 0px rgba(0,0,0,0.25)',

        /* borders */
        '--border-radius-primary': '0px',
        '--border-radius-secondary': '0px',

        '--border-width-primary': '1px solid',
        '--border-width-secondary': '2px solid',

        '--font-family': 'LindeDax',
    },
};

const themeStill: Theme = {
    name: 'Still',
    iconSet: (STILL_ICONS as any).default,
    cssClassName: 'theme-STILL',
    properties: {
        /* colors */
        '--brand-700': '#E35F00',
        '--brand-500': '#fcb900',

        '--gray-900': '#302E2C',
        '--gray-700': '#545454',
        '--gray-600': '#71706F',
        '--gray-400': '#969492',
        '--gray-300': '#CBC9C8',
        '--gray-100': '#F2F2F2',
        '--gray-50': '#F8F8F8',
        '--white': '#FFFFFF',
        '--black': '#000000',

        '--success': '#66CC00',
        '--warning': '#FFC100',
        '--background-warning-alert': '#FFF3CC',
        '--danger': '#FF0606',
        '--background-danger-alert': '#FFCDCD',
        '--promotion': 'rgba(0,0,0,0.75)',

        /* background colors */
        '--background-primary': '#FFFFFF',
        '--background-secondary': '#F2F2F2',
        '--background-tertiary': '#f2f2f2',
        '--background-quarternary': '#FFFFFF',
        '--background-modal': 'rgba(0,0,0,0.3)',
        '--background-danger': '#FFCDCD',
        '--background-warning': 'FFF3CC',

        /* button colors */
        '--button-primary': '#F96915',
        '--button-hover': '#E35F00',
        '--button-secondary': '#EEEFF3',
        '--button-disabled': '#EEEFF4',

        /* border colors */
        '--button-primary-border': '#F96915',
        '--button-primary-hover-border': '#F96915',
        '--button-dark-gray-border': '#545454',
        '--button-gray-border': '#969492',
        '--button-light-gray-border': '#CBC9C8',

        /* text colors */
        '--text-900': '#302E2C',
        '--text-700': '#545454',
        '--text-600': '#71706F',
        '--text-400': '#969492',
        '--text-300': '#CBC9C8',
        '--text-white': '#FFFFFF',
        '--text-brand-500': '#f96915',
        '--text-danger': '#ff0606',
        '--text-success': '#66cc00',

        /* toast colors */
        '--toast-error': '#FF0606',
        '--toast-success': '#66CC00',
        '--toast-warning': '#FFC100',

        /* promotion colors */
        '--promotion-info': 'rgba(0,0,0,0.75)',

        /* font weight */
        '--font-weight-regular': '400',
        '--font-weight-bold': '700',

        /* font sizes */
        '--title-font-size-xxl': '58px',
        '--title-font-size-xl': '50px',
        '--title-font-size-l': '43px',
        '--title-font-size-m': '34px',
        '--title-font-size-s': '26px',
        '--title-font-size-xs': '22px',
        '--body-font-size-l': '20px',
        '--body-font-size-m': '18px',
        '--body-font-size-s': '15px',
        '--body-font-size-xs': '13px',
        '--body-font-size-xxs': '11px',

        '--title-line-height-xxl': '120%',
        '--title-line-height-xl': '140%',
        '--title-line-height-l': '140%',
        '--title-line-height-m': '140%',
        '--title-line-height-s': '140%',
        '--title-line-height-xs': '135%',
        '--body-line-height-l': '135%',
        '--body-line-height-m': '135%',
        '--body-line-height-s': '140%',
        '--body-line-height-xs': '115%',
        '--body-line-height-xxs': '115%',

        /* spaces (same for Linde and Still) */
        '--no-space': '0px',
        '--s-space-xxxs': '4px',
        '--s-space-xxs': '8px',
        '--s-space-xs': '12px',
        '--s-space-s': '16px',
        '--s-space-m': '24px',
        '--s-space-l': '32px',
        '--s-space-xl': '40px',
        '--l-space-s': '48px',
        '--l-space-m': '64px',
        '--l-space-l': '80px',
        '--l-space-xl': '100px',

        /* box-shadows */
        '--small-shadow': '0px 3px 6px 2px rgba(0,0,0,0.25)',
        '--regular-shadow': '0.5px 4px 8 2px rgba(0,0,0,0.15)',
        '--large-shadow': '1px 10px 20 2px rgba(0,0,0,0.15)',

        /* borders */
        '--border-radius-primary': '2.5px',
        '--border-radius-secondary': '0px',

        '--border-width-primary': '1px solid',
        '--border-width-secondary': '2px solid',

        '--font-family': 'Still',
    },
};
const themeBaoli: Theme = {
    name: 'Baoli',
    iconSet: (BAOLI_ICONS as any).default,
    cssClassName: 'theme-BAOLI',
    properties: {
        /* colors */
        '--brand-700': '#203259',
        '--brand-500': '#fcb900',

        '--gray-900': '#302E2C',
        '--gray-700': '#545454',
        '--gray-600': '#71706F',
        '--gray-400': '#969492',
        '--gray-300': '#CBC9C8',
        '--gray-100': '#F2F2F2',
        '--gray-50': '#F8F8F8',
        '--white': '#FFFFFF',
        '--black': '#000000',

        '--success': '#66CC00',
        '--warning': '#FFC100',
        '--background-warning-alert': '#FFF3CC',
        '--danger': '#FF0606',
        '--background-danger-alert': '#FFCDCD',
        '--promotion': 'rgba(0,0,0,0.75)',

        /* background colors */
        '--background-primary': '#FFFFFF',
        '--background-secondary': '#F2F2F2',
        '--background-tertiary': '#f2f2f2',
        '--background-quarternary': '#FFFFFF',
        '--background-modal': 'rgba(0,0,0,0.3)',
        '--background-danger': '#FFCDCD',
        '--background-warning': 'FFF3CC',

        /* button colors */
        '--button-primary': '#0065BD',
        '--button-hover': '#203259',
        '--button-secondary': '#F0F0F0',
        '--button-disabled': '#EEEFF4',

        /* border colors */
        '--button-primary-border': '#0065BD',
        '--button-primary-hover-border': '#203259',
        '--button-dark-gray-border': '#545454',
        '--button-gray-border': '#969492',
        '--button-light-gray-border': '#CBC9C8',

        /* text colors */
        '--text-900': '#302E2C',
        '--text-700': '#545454',
        '--text-600': '#71706F',
        '--text-400': '#969492',
        '--text-300': '#CBC9C8',
        '--text-white': '#FFFFFF',
        '--text-brand-500': '#0065BD',
        '--text-danger': '#ff0606',
        '--text-success': '#66cc00',

        /* toast colors */
        '--toast-error': '#FF0606',
        '--toast-success': '#66CC00',
        '--toast-warning': '#FFC100',

        /* promotion colors */
        '--promotion-info': 'rgba(0,0,0,0.75)',

        /* font weight */
        '--font-weight-regular': '400',
        '--font-weight-bold': '700',

        /* font sizes */
        '--title-font-size-xxl': '58px',
        '--title-font-size-xl': '50px',
        '--title-font-size-l': '43px',
        '--title-font-size-m': '34px',
        '--title-font-size-s': '26px',
        '--title-font-size-xs': '22px',
        '--body-font-size-l': '20px',
        '--body-font-size-m': '18px',
        '--body-font-size-s': '15px',
        '--body-font-size-xs': '13px',
        '--body-font-size-xxs': '11px',

        '--title-line-height-xxl': '120%',
        '--title-line-height-xl': '140%',
        '--title-line-height-l': '140%',
        '--title-line-height-m': '140%',
        '--title-line-height-s': '140%',
        '--title-line-height-xs': '135%',
        '--body-line-height-l': '135%',
        '--body-line-height-m': '135%',
        '--body-line-height-s': '140%',
        '--body-line-height-xs': '115%',
        '--body-line-height-xxs': '115%',

        /* spaces (same for Linde and Still) */
        '--no-space': '0px',
        '--s-space-xxxs': '4px',
        '--s-space-xxs': '8px',
        '--s-space-xs': '12px',
        '--s-space-s': '16px',
        '--s-space-m': '24px',
        '--s-space-l': '32px',
        '--s-space-xl': '40px',
        '--l-space-s': '48px',
        '--l-space-m': '64px',
        '--l-space-l': '80px',
        '--l-space-xl': '100px',

        /* box-shadows */
        '--small-shadow': '0px 3px 6px 2px rgba(0,0,0,0.25)',
        '--regular-shadow': '0.5px 4px 8 2px rgba(0,0,0,0.15)',
        '--large-shadow': '1px 10px 20 2px rgba(0,0,0,0.15)',

        /* borders */
        '--border-radius-primary': '40px',
        '--border-radius-secondary': '0px',

        '--border-width-primary': '1px solid',
        '--border-width-secondary': '2px solid',

        '--font-family': 'Arial',
    },
};

export const listOfThemes: Theme[] = [themeKion, themeLinde, themeStill, themeBaoli];
